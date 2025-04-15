import * as THREE from 'three';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { LoopSubdivision } from 'three-subdivide';

function simplifyMesh(
    mesh:any,
    options = {
      targetReduction: 0.5, // Percentage (0-1) of triangles to remove
      aggressiveness: 2,    // Higher means more aggressive simplification
      preserveGeometryBorders: true,
      preserveUVs: true,
      preserveNormals: true
    }
  ) {
    // Clone the mesh to avoid modifying the original
    const clonedMesh = mesh.clone();
    const geometry = clonedMesh.geometry;
  
    // Ensure the geometry has indices
    if (!geometry.index) {
      geometry.setIndex(
        Array.from({ length: geometry.attributes.position.count }, (_, i) => i)
      );
    }
  
    // Create a modified version of the mesh
    // The modifier is used to simplify the geometry
    const modifier = new SimplifyModifier();
    
    // Calculate the number of triangles to remove
    const triangleCount = geometry.index.count / 3;
    const targetTriangles = Math.floor(triangleCount * (1 - options.targetReduction));
    
    // Simplify the geometry - with simplified parameters that match the actual API
    let simplifiedGeometry = modifier.modify(
      geometry,
      Math.max(1, targetTriangles) // Ensure at least 1 triangle remains
    );
  
    // If the geometry has normals, make sure to recompute them
    if (geometry.attributes.normal) {
      simplifiedGeometry.computeVertexNormals();
    }
  
    // Create a new mesh with the simplified geometry and the original material
    const simplifiedMesh = new THREE.Mesh(simplifiedGeometry, clonedMesh.material);
    
    // Copy the transformation from the original mesh
    simplifiedMesh.position.copy(mesh.position);
    simplifiedMesh.rotation.copy(mesh.rotation);
    simplifiedMesh.scale.copy(mesh.scale);
    
    return simplifiedMesh;
  }

  export { simplifyMesh };


  
function retopologizeMesh(
  mesh,
  options = {
    targetFaces: 1000,
    subdivisions: 1,
    relaxationIterations: 5,
    projectToOriginal: true
  }
) {
  // Clone the original mesh
  const originalMesh = mesh.clone();
  
  // Step 1: Simplify the mesh
  const simplifiedGeometry = simplifyOriginalMesh(originalMesh.geometry, options.targetFaces);
  
  // Step 2: Subdivide the simplified mesh
  const subdividedGeometry = subdivideGeometry(simplifiedGeometry, options.subdivisions);
  
  // Step 3: Relax the vertex positions
  const relaxedGeometry = relaxGeometry(subdividedGeometry, options.relaxationIterations);
  
  // Step 4: Project vertices back onto the original surface if needed
  const finalGeometry = options.projectToOriginal
    ? projectToOriginal(relaxedGeometry, originalMesh)
    : relaxedGeometry;
  
  // Create the final retopologized mesh
  const retopologizedMesh = new THREE.Mesh(finalGeometry, originalMesh.material);
  
  return retopologizedMesh;
}

function simplifyOriginalMesh(geometry, targetFaces) {
  const modifier = new SimplifyModifier();
  const simplifiedGeometry = modifier.modify(geometry, targetFaces);
  return simplifiedGeometry;
}

function subdivideGeometry(geometry, iterations) {
  const params = {
    split: true,
    uvSmooth: false,
    preserveEdges: false,
    flatOnly: false,
    maxTriangles: Infinity
  };
  
  return LoopSubdivision.modify(geometry, iterations, params);
}

function relaxGeometry(geometry, iterations) {
  const positionAttribute = geometry.attributes.position;
  const indexAttribute = geometry.index;
  
  // Create a map of vertex neighbors
  const vertexNeighbors = new Map();
  for (let i = 0; i < positionAttribute.count; i++) {
    vertexNeighbors.set(i, []);
  }
  
  // Find neighbors using the index buffer
  for (let i = 0; i < indexAttribute.count; i += 3) {
    const a = indexAttribute.getX(i);
    const b = indexAttribute.getX(i + 1);
    const c = indexAttribute.getX(i + 2);
    
    vertexNeighbors.get(a).push(b, c);
    vertexNeighbors.get(b).push(a, c);
    vertexNeighbors.get(c).push(a, b);
  }
  
  // Perform relaxation
  const tempPositions = new Float32Array(positionAttribute.array.length);
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < positionAttribute.count; i++) {
      const neighbors = vertexNeighbors.get(i);
      const avgPos = new THREE.Vector3();
      
      for (const neighborIdx of neighbors) {
        avgPos.add(new THREE.Vector3().fromBufferAttribute(positionAttribute, neighborIdx));
      }
      
      avgPos.divideScalar(neighbors.length);
      
      tempPositions[i * 3] = avgPos.x;
      tempPositions[i * 3 + 1] = avgPos.y;
      tempPositions[i * 3 + 2] = avgPos.z;
    }
    
    // Update positions
    for (let i = 0; i < positionAttribute.count; i++) {
      positionAttribute.setXYZ(i, tempPositions[i * 3], tempPositions[i * 3 + 1], tempPositions[i * 3 + 2]);
    }
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

function projectToOriginal(geometry, originalMesh) {
  const raycaster = new THREE.Raycaster();
  const positionAttribute = geometry.attributes.position;
  
  for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
    const normal = new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal, i);
    
    raycaster.set(vertex, normal);
    const intersects = raycaster.intersectObject(originalMesh);
    
    if (intersects.length > 0) {
      positionAttribute.setXYZ(i, intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
    }
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

  
  // Export the function
  export { retopologizeMesh };