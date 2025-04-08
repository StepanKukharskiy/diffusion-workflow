import * as THREE from 'three';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

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