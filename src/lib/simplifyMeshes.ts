import * as THREE from 'three';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { LoopSubdivision } from 'three-subdivide';

// function retopologizeMesh(
//   mesh,
//   options = {
//     targetReduction: 0.8,    // Percentage (0-1) of triangles to remove in simplification
//     subdivisions: 1,         // Number of subdivision iterations
//     preserveUVs: true,       // Whether to preserve UV coordinates
//     preserveBorders: true,   // Whether to preserve mesh borders
//     relaxationIterations: 0  // Optional relaxation between steps (0 to disable)
//   }
// ) {
//   // Step 1: Simplify the mesh using your existing function
//   const simplifiedMesh = simplifyMesh(mesh, {
//     targetReduction: options.targetReduction,
//     aggressiveness: 2,
//     preserveGeometryBorders: options.preserveBorders,
//     preserveUVs: options.preserveUVs,
//     preserveNormals: true
//   });
  
//   // Optional: Apply relaxation to improve triangle quality
//   let processedMesh = simplifiedMesh;
//   if (options.relaxationIterations > 0) {
//     processedMesh = relaxMesh(simplifiedMesh, options.relaxationIterations, options.preserveUVs);
//   }
  
//   // Step 2: Apply loop subdivision to add detail with regular topology
//   let subdividedMesh = processedMesh;
//   if (options.subdivisions > 0) {
//     subdividedMesh = subdivideMesh(processedMesh, options.subdivisions, options.preserveUVs);
//   }
  
//   return subdividedMesh;
// }

function retopologizeMesh(
  mesh,
  options = {
    targetReduction: 0.8,
    subdivisions: 1,
    preserveUVs: true,
    preserveBorders: true,
    relaxationIterations: 3,  // Increased from 0
    relaxationStrength: 0.3   // Added parameter for control
  }
) {
  // Step 1: Simplify the mesh using your existing function
  const simplifiedMesh = simplifyMesh(mesh, {
    targetReduction: options.targetReduction,
    aggressiveness: 2,
    preserveGeometryBorders: options.preserveBorders,
    preserveUVs: options.preserveUVs,
    preserveNormals: true
  });
  
  // Step 2: Apply relaxation with the improved function
  let processedMesh = simplifiedMesh;
  if (options.relaxationIterations > 0) {
    // Pass the relaxation strength to the improved function
    processedMesh = relaxMesh(
      simplifiedMesh, 
      options.relaxationIterations, 
      options.preserveUVs
    );
  }
  
  // Step 3: Apply loop subdivision to add detail with regular topology
  let subdividedMesh = processedMesh;
  if (options.subdivisions > 0) {
    subdividedMesh = subdivideMesh(processedMesh, options.subdivisions, options.preserveUVs);
  }
  
  return subdividedMesh;
}


// Your existing simplifyMesh function
function simplifyMesh(
  mesh,
  options = {
    targetReduction: 0.5,
    aggressiveness: 2,
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
  const modifier = new SimplifyModifier();
  
  // Calculate the number of triangles to remove
  const triangleCount = geometry.index.count / 3;
  const targetTriangles = Math.floor(triangleCount * (1 - options.targetReduction));
  
  // Simplify the geometry
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

// Function to apply loop subdivision
function subdivideMesh(mesh, iterations, preserveUVs) {
  // Clone the mesh to avoid modifying the original
  const clonedMesh = mesh.clone();
  const geometry = clonedMesh.geometry;
  
  // Configure subdivision parameters
  const params = {
    split: false,                // Don't split coplanar faces
    uvSmooth: true,              // Smooth UV coordinates
    preserveEdges: preserveUVs,  // Preserve edges if preserving UVs
    flatOnly: false,             // Apply smoothing, not just subdivision
    maxTriangles: Infinity       // No limit on triangle count
  };
  
  // Apply loop subdivision
  const subdividedGeometry = LoopSubdivision.modify(geometry, iterations, params);
  
  // Create a new mesh with the subdivided geometry
  const subdividedMesh = new THREE.Mesh(subdividedGeometry, clonedMesh.material);
  
  // Copy the transformation
  subdividedMesh.position.copy(mesh.position);
  subdividedMesh.rotation.copy(mesh.rotation);
  subdividedMesh.scale.copy(mesh.scale);
  
  return subdividedMesh;
}

// Function to relax vertex positions while preserving UV borders
// function relaxMesh(mesh, iterations, preserveUVs) {
//   // Clone the mesh to avoid modifying the original
//   const clonedMesh = mesh.clone();
//   const geometry = clonedMesh.geometry;
//   const positionAttribute = geometry.attributes.position;
//   const indexAttribute = geometry.index;
  
//   // Identify UV borders if needed
//   let uvBorderVertices = new Set();
//   if (preserveUVs) {
//     uvBorderVertices = identifyUVBorderVertices(geometry);
//   }
  
//   // Create a map of vertex neighbors
//   const vertexNeighbors = new Map();
//   for (let i = 0; i < positionAttribute.count; i++) {
//     vertexNeighbors.set(i, []);
//   }
  
//   // Find neighbors using the index buffer
//   for (let i = 0; i < indexAttribute.count; i += 3) {
//     const a = indexAttribute.getX(i);
//     const b = indexAttribute.getX(i + 1);
//     const c = indexAttribute.getX(i + 2);
    
//     // Add unique neighbors
//     if (!vertexNeighbors.get(a).includes(b)) vertexNeighbors.get(a).push(b);
//     if (!vertexNeighbors.get(a).includes(c)) vertexNeighbors.get(a).push(c);
    
//     if (!vertexNeighbors.get(b).includes(a)) vertexNeighbors.get(b).push(a);
//     if (!vertexNeighbors.get(b).includes(c)) vertexNeighbors.get(b).push(c);
    
//     if (!vertexNeighbors.get(c).includes(a)) vertexNeighbors.get(c).push(a);
//     if (!vertexNeighbors.get(c).includes(b)) vertexNeighbors.get(c).push(b);
//   }
  
//   // Temporary array for storing relaxed positions
//   const tempPositions = new Float32Array(positionAttribute.array.length);
  
//   // Perform relaxation iterations
//   for (let iter = 0; iter < iterations; iter++) {
//     for (let i = 0; i < positionAttribute.count; i++) {
//       // Skip UV border vertices if preserving UVs
//       if (preserveUVs && uvBorderVertices.has(i)) {
//         tempPositions[i * 3] = positionAttribute.getX(i);
//         tempPositions[i * 3 + 1] = positionAttribute.getY(i);
//         tempPositions[i * 3 + 2] = positionAttribute.getZ(i);
//         continue;
//       }
      
//       const neighbors = vertexNeighbors.get(i);
      
//       if (neighbors.length > 0) {
//         // Calculate the average position of neighbors
//         const avgPos = new THREE.Vector3(0, 0, 0);
        
//         for (const neighborIdx of neighbors) {
//           avgPos.x += positionAttribute.getX(neighborIdx);
//           avgPos.y += positionAttribute.getY(neighborIdx);
//           avgPos.z += positionAttribute.getZ(neighborIdx);
//         }
        
//         avgPos.divideScalar(neighbors.length);
        
//         // Use 50% of original position and 50% of average position
//         const relaxFactor = 0.5;
//         const currentPos = new THREE.Vector3(
//           positionAttribute.getX(i),
//           positionAttribute.getY(i),
//           positionAttribute.getZ(i)
//         );
        
//         currentPos.lerp(avgPos, relaxFactor);
        
//         // Store the relaxed position
//         tempPositions[i * 3] = currentPos.x;
//         tempPositions[i * 3 + 1] = currentPos.y;
//         tempPositions[i * 3 + 2] = currentPos.z;
//       } else {
//         // If no neighbors, keep the original position
//         tempPositions[i * 3] = positionAttribute.getX(i);
//         tempPositions[i * 3 + 1] = positionAttribute.getY(i);
//         tempPositions[i * 3 + 2] = positionAttribute.getZ(i);
//       }
//     }
    
//     // Update the position attribute with relaxed positions
//     for (let i = 0; i < positionAttribute.count; i++) {
//       positionAttribute.setXYZ(
//         i,
//         tempPositions[i * 3],
//         tempPositions[i * 3 + 1],
//         tempPositions[i * 3 + 2]
//       );
//     }
    
//     positionAttribute.needsUpdate = true;
//   }
  
//   // Compute normals after relaxation
//   geometry.computeVertexNormals();
  
//   // Create a new mesh with the relaxed geometry
//   const relaxedMesh = new THREE.Mesh(geometry, clonedMesh.material);
  
//   // Copy the transformation
//   relaxedMesh.position.copy(mesh.position);
//   relaxedMesh.rotation.copy(mesh.rotation);
//   relaxedMesh.scale.copy(mesh.scale);
  
//   return relaxedMesh;
// }
function relaxMesh(mesh, iterations, preserveUVs) {
  // Clone the mesh to avoid modifying the original
  const clonedMesh = mesh.clone();
  const geometry = clonedMesh.geometry;
  const positionAttribute = geometry.attributes.position;
  const indexAttribute = geometry.index;
  
  // Identify borders to preserve
  let borderVertices = new Set();
  if (preserveUVs) {
    // Identify UV borders
    borderVertices = identifyUVBorderVertices(geometry);
    
    // Additionally identify geometric borders (optional but recommended)
    const geometricBorders = identifyGeometricBorderVertices(geometry);
    geometricBorders.forEach(vertex => borderVertices.add(vertex));
  }
  
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
    
    // Add unique neighbors
    if (!vertexNeighbors.get(a).includes(b)) vertexNeighbors.get(a).push(b);
    if (!vertexNeighbors.get(a).includes(c)) vertexNeighbors.get(a).push(c);
    
    if (!vertexNeighbors.get(b).includes(a)) vertexNeighbors.get(b).push(a);
    if (!vertexNeighbors.get(b).includes(c)) vertexNeighbors.get(b).push(c);
    
    if (!vertexNeighbors.get(c).includes(a)) vertexNeighbors.get(c).push(a);
    if (!vertexNeighbors.get(c).includes(b)) vertexNeighbors.get(c).push(b);
  }
  
  // Create temporary arrays for positions
  const tempPositions = new Float32Array(positionAttribute.array.length);
  
  // Use adaptive relaxation factor that decreases with iterations
  const initialRelaxFactor = 0.3; // Start with a gentler factor
  
  // Perform relaxation iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Calculate adaptive relaxation factor that decreases with iterations
    const relaxFactor = initialRelaxFactor * (1 - iter / iterations);
    
    // First, copy all current positions to temp array
    for (let i = 0; i < positionAttribute.count; i++) {
      tempPositions[i * 3] = positionAttribute.getX(i);
      tempPositions[i * 3 + 1] = positionAttribute.getY(i);
      tempPositions[i * 3 + 2] = positionAttribute.getZ(i);
    }
    
    // Then calculate new positions
    for (let i = 0; i < positionAttribute.count; i++) {
      // Skip border vertices
      if (borderVertices.has(i)) {
        continue;
      }
      
      const neighbors = vertexNeighbors.get(i);
      
      if (neighbors.length > 0) {
        // Calculate the average position of neighbors
        let avgX = 0, avgY = 0, avgZ = 0;
        
        for (const neighborIdx of neighbors) {
          avgX += positionAttribute.getX(neighborIdx);
          avgY += positionAttribute.getY(neighborIdx);
          avgZ += positionAttribute.getZ(neighborIdx);
        }
        
        avgX /= neighbors.length;
        avgY /= neighbors.length;
        avgZ /= neighbors.length;
        
        // Current position
        const currentX = positionAttribute.getX(i);
        const currentY = positionAttribute.getY(i);
        const currentZ = positionAttribute.getZ(i);
        
        // Interpolate between current position and average position
        tempPositions[i * 3] = currentX * (1 - relaxFactor) + avgX * relaxFactor;
        tempPositions[i * 3 + 1] = currentY * (1 - relaxFactor) + avgY * relaxFactor;
        tempPositions[i * 3 + 2] = currentZ * (1 - relaxFactor) + avgZ * relaxFactor;
      }
    }
    
    // Update the position attribute with relaxed positions
    for (let i = 0; i < positionAttribute.count; i++) {
      positionAttribute.setXYZ(
        i,
        tempPositions[i * 3],
        tempPositions[i * 3 + 1],
        tempPositions[i * 3 + 2]
      );
    }
    
    positionAttribute.needsUpdate = true;
  }
  
  // Compute normals after relaxation
  geometry.computeVertexNormals();
  
  // Create a new mesh with the relaxed geometry
  const relaxedMesh = new THREE.Mesh(geometry, clonedMesh.material);
  
  // Copy the transformation
  relaxedMesh.position.copy(mesh.position);
  relaxedMesh.rotation.copy(mesh.rotation);
  relaxedMesh.scale.copy(mesh.scale);
  
  return relaxedMesh;
}


// Function to identify vertices that are part of UV borders
function identifyUVBorderVertices(geometry) {
  const uvAttribute = geometry.attributes.uv;
  const indexAttribute = geometry.index;
  
  if (!uvAttribute || !indexAttribute) {
    console.warn('Geometry must have UV coordinates and indices to identify UV borders');
    return new Set();
  }
  
  // Map to track vertices that appear in multiple triangles with different UVs
  const vertexUVs = new Map();
  const borderVertices = new Set();
  
  // For each triangle
  for (let i = 0; i < indexAttribute.count; i += 3) {
    const indices = [
      indexAttribute.getX(i),
      indexAttribute.getX(i + 1),
      indexAttribute.getX(i + 2)
    ];
    
    // Check each vertex
    for (const vertexIndex of indices) {
      const u = uvAttribute.getX(vertexIndex);
      const v = uvAttribute.getY(vertexIndex);
      const uvKey = `${u.toFixed(6)},${v.toFixed(6)}`;
      
      if (!vertexUVs.has(vertexIndex)) {
        // First time seeing this vertex
        vertexUVs.set(vertexIndex, [uvKey]);
      } else {
        // We've seen this vertex before
        const existingUVs = vertexUVs.get(vertexIndex);
        
        // If this vertex has a different UV coordinate than previously seen,
        // it's on a UV border
        if (!existingUVs.includes(uvKey)) {
          existingUVs.push(uvKey);
          borderVertices.add(vertexIndex);
        }
      }
    }
  }
  
  return borderVertices;
}

function identifyGeometricBorderVertices(geometry) {
  const positionAttribute = geometry.attributes.position;
  const indexAttribute = geometry.index;
  
  // Create an edge map to count how many times each edge appears
  const edgeMap = new Map();
  const borderVertices = new Set();
  
  // For each triangle
  for (let i = 0; i < indexAttribute.count; i += 3) {
    const indices = [
      indexAttribute.getX(i),
      indexAttribute.getX(i + 1),
      indexAttribute.getX(i + 2)
    ];
    
    // Check each edge
    for (let j = 0; j < 3; j++) {
      const v1 = indices[j];
      const v2 = indices[(j + 1) % 3];
      
      // Create a unique key for this edge (always put smaller index first)
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      
      // Count occurrences of this edge
      edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1);
    }
  }
  
  // Find edges that appear only once (boundary edges)
  for (const [edgeKey, count] of edgeMap.entries()) {
    if (count === 1) {
      // This is a boundary edge, add both vertices to the set
      const [v1, v2] = edgeKey.split('-').map(Number);
      borderVertices.add(v1);
      borderVertices.add(v2);
    }
  }
  
  return borderVertices;
}


  // Export the function
  export { simplifyMesh, retopologizeMesh };