import * as THREE from 'three';

function createSegmentedMeshByUVIslands(mesh) {
  const geometry = mesh.geometry;

  // Ensure we have UV coordinates
  if (!geometry.attributes.uv) {
    console.error('Mesh does not have UV coordinates');
    return null;
  }

  // Get the necessary attributes
  const positionAttr = geometry.attributes.position;
  const uvAttr = geometry.attributes.uv;
  const indices = geometry.index ? geometry.index.array : null;

  // Calculate the number of triangles
  const triangleCount = indices ? indices.length / 3 : positionAttr.count / 3;

  // Create a map to track which polygons belong to which UV island
  const islandMap = new Map();
  let currentIslandId = 0;

  // Create an edge map to track connectivity in UV space
  const edgeMap = new Map();

  // Define a small epsilon for floating-point comparison
  const epsilon = 1e-6;

  // Helper function to check if two UV points are the same
  const isSameUV = (a, b) => {
    return Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon;
  };

  // Helper function to get a unique key for an edge in UV space
  const getEdgeKey = (a, b) => {
    // Ensure consistent ordering
    if (a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])) {
      return `${a[0]},${a[1]}_${b[0]},${b[1]}`;
    }
    return `${b[0]},${b[1]}_${a[0]},${a[1]}`;
  };

  // First pass: build the edge connectivity in UV space
  for (let i = 0; i < triangleCount; i++) {
    let idx1, idx2, idx3;

    if (indices) {
      idx1 = indices[i * 3];
      idx2 = indices[i * 3 + 1];
      idx3 = indices[i * 3 + 2];
    } else {
      idx1 = i * 3;
      idx2 = i * 3 + 1;
      idx3 = i * 3 + 2;
    }

    // Get UV coordinates for each vertex
    const uv1 = [uvAttr.array[idx1 * 2], uvAttr.array[idx1 * 2 + 1]];
    const uv2 = [uvAttr.array[idx2 * 2], uvAttr.array[idx2 * 2 + 1]];
    const uv3 = [uvAttr.array[idx3 * 2], uvAttr.array[idx3 * 2 + 1]];

    // Add triangle edges to the edge map
    const edge1Key = getEdgeKey(uv1, uv2);
    const edge2Key = getEdgeKey(uv2, uv3);
    const edge3Key = getEdgeKey(uv3, uv1);

    if (!edgeMap.has(edge1Key)) edgeMap.set(edge1Key, []);
    if (!edgeMap.has(edge2Key)) edgeMap.set(edge2Key, []);
    if (!edgeMap.has(edge3Key)) edgeMap.set(edge3Key, []);

    edgeMap.get(edge1Key).push(i);
    edgeMap.get(edge2Key).push(i);
    edgeMap.get(edge3Key).push(i);
  }

  // Second pass: use a flood-fill algorithm to identify islands
  const visitedTriangles = new Set();

  for (let i = 0; i < triangleCount; i++) {
    if (visitedTriangles.has(i)) continue;

    // Start a new island
    const islandId = currentIslandId++;
    const queue = [i];
    visitedTriangles.add(i);
    islandMap.set(i, islandId);

    // Process all connected triangles
    while (queue.length > 0) {
      const triangleIdx = queue.shift();

      // Get the triangle's vertices
      let idx1, idx2, idx3;

      if (indices) {
        idx1 = indices[triangleIdx * 3];
        idx2 = indices[triangleIdx * 3 + 1];
        idx3 = indices[triangleIdx * 3 + 2];
      } else {
        idx1 = triangleIdx * 3;
        idx2 = triangleIdx * 3 + 1;
        idx3 = triangleIdx * 3 + 2;
      }

      // Get UV coordinates
      const uv1 = [uvAttr.array[idx1 * 2], uvAttr.array[idx1 * 2 + 1]];
      const uv2 = [uvAttr.array[idx2 * 2], uvAttr.array[idx2 * 2 + 1]];
      const uv3 = [uvAttr.array[idx3 * 2], uvAttr.array[idx3 * 2 + 1]];

      // Check all edges of this triangle
      const edge1Key = getEdgeKey(uv1, uv2);
      const edge2Key = getEdgeKey(uv2, uv3);
      const edge3Key = getEdgeKey(uv3, uv1);

      const processEdge = (edgeKey) => {
        const connectedTriangles = edgeMap.get(edgeKey);
        for (const connectedIdx of connectedTriangles) {
          if (!visitedTriangles.has(connectedIdx)) {
            visitedTriangles.add(connectedIdx);
            islandMap.set(connectedIdx, islandId);
            queue.push(connectedIdx);
          }
        }
      };

      processEdge(edge1Key);
      processEdge(edge2Key);
      processEdge(edge3Key);
    }
  }

  // Create a map to group triangles by island
  const islands = new Map();
  for (let i = 0; i < triangleCount; i++) {
    const islandId = islandMap.get(i);
    if (!islands.has(islandId)) {
      islands.set(islandId, []);
    }
    islands.get(islandId).push(i);
  }

  // Create separate meshes for each island
  const segmentedMeshes = [];

  islands.forEach((triangles, islandId) => {
    // Create a new geometry for this island
    const islandGeometry = new THREE.BufferGeometry();

    if (indices) {
      // For indexed geometries
      const newIndices = [];
      const vertexMap = new Map();
      let nextIndex = 0;

      for (const triangleIndex of triangles) {
        for (let j = 0; j < 3; j++) {
          const originalIndex = indices[triangleIndex * 3 + j];

          if (!vertexMap.has(originalIndex)) {
            vertexMap.set(originalIndex, nextIndex++);
          }

          newIndices.push(vertexMap.get(originalIndex));
        }
      }

      // Create new attribute arrays
      const newAttributes = {};
      for (const name in geometry.attributes) {
        const attribute = geometry.attributes[name];
        const itemSize = attribute.itemSize;
        const array = attribute.array;
        const newArray = new Float32Array(vertexMap.size * itemSize);

        for (const [originalIndex, newIndex] of vertexMap.entries()) {
          for (let k = 0; k < itemSize; k++) {
            newArray[newIndex * itemSize + k] = array[originalIndex * itemSize + k];
          }
        }

        newAttributes[name] = new THREE.BufferAttribute(newArray, itemSize);
      }

      // Set attributes and indices
      for (const name in newAttributes) {
        islandGeometry.setAttribute(name, newAttributes[name]);
      }

      islandGeometry.setIndex(newIndices);
    } else {
      // For non-indexed geometries
      const newPositions = [];

      // Copy other attribute arrays if needed
      const newAttributes = {};
      for (const name in geometry.attributes) {
        newAttributes[name] = [];
      }

      for (const triangleIndex of triangles) {
        const baseIndex = triangleIndex * 9;

        // Copy position data for this triangle
        for (let j = 0; j < 9; j++) {
          newPositions.push(positionAttr.array[baseIndex + j]);
        }

        // Copy other attribute data
        for (const name in geometry.attributes) {
          if (name === 'position') continue;

          const attribute = geometry.attributes[name];
          const itemSize = attribute.itemSize;
          const vertexBaseIndex = triangleIndex * 3 * itemSize;

          for (let j = 0; j < 3 * itemSize; j++) {
            newAttributes[name].push(attribute.array[vertexBaseIndex + j]);
          }
        }
      }

      // Set position attribute
      islandGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(newPositions), 3)
      );

      // Set other attributes
      for (const name in newAttributes) {
        if (name === 'position') continue;

        const attribute = geometry.attributes[name];
        islandGeometry.setAttribute(
          name,
          new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
        );
      }
    }

    // Create a color based on the island ID using HSL
    const hue = (islandId * 137.5) % 360; // Golden angle for good distribution
    const saturation = 0.85;
    const lightness = 0.5;
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    const islandMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.7
    });

    // Create a new mesh
    const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial);
    islandMesh.geometry.computeVertexNormals();
    islandMesh.material.needsUpdate = true;

    segmentedMeshes.push(islandMesh);
  });

  return segmentedMeshes;
}

// Export the function if using ES modules
export { createSegmentedMeshByUVIslands };

function segmentMeshByTextureColor(
    mesh: THREE.Mesh,
    options = {
      resolution: 1024,
      colorThreshold: DEFAULT_COLOR_THRESHOLD,
      minSegmentSize: 10,
      simplifySegments: true
    }
  ): THREE.Mesh[] {
    // Create a temporary canvas to analyze texture colors
    const canvas = document.createElement('canvas');
    const textureCanvas = drawMeshTextureToCanvas(mesh, canvas, {
      resolution: options.resolution,
      wireframe: false,
      showTexture: true,
      fillColor: 'transparent',
      wireframeColor: 'transparent',
      wireframeWidth: 0,
      background: 'transparent'
    });
  
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((mat) => {
        if (mat.map) mat.map.needsUpdate = true;
        mat.needsUpdate = true;
      });
    } else {
      if (mesh.material.map) mesh.material.map.needsUpdate = true;
      mesh.material.needsUpdate = true;
    }
  
    if (!textureCanvas) {
      console.error('Failed to draw texture to canvas');
      return [mesh];
    }
  
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return [mesh];
    }
  
    // Get geometry data
    const geometry = mesh.geometry;
    const uvAttribute = geometry.attributes.uv;
    const positionAttribute = geometry.attributes.position;
    const indices = geometry.index ? geometry.index.array : null;
    const triangleCount = indices ? indices.length / 3 : positionAttribute.count / 3;
  
    // Create a map to store triangle colors
    const triangleColors: { r: number; g: number; b: number; a: number }[] = [];
    const triangleIndices: number[][] = [];
  
    // Sample the color at the center of each triangle's UV coordinates
    for (let i = 0; i < triangleCount; i++) {
      let idx1, idx2, idx3;
  
      if (indices) {
        idx1 = indices[i * 3];
        idx2 = indices[i * 3 + 1];
        idx3 = indices[i * 3 + 2];
      } else {
        idx1 = i * 3;
        idx2 = i * 3 + 1;
        idx3 = i * 3 + 2;
      }
  
      triangleIndices.push([idx1, idx2, idx3]);
  
      // Get UV coordinates for each vertex
      const u1 = uvAttribute.array[idx1 * 2];
      const v1 = uvAttribute.array[idx1 * 2 + 1];
      const u2 = uvAttribute.array[idx2 * 2];
      const v2 = uvAttribute.array[idx2 * 2 + 1];
      const u3 = uvAttribute.array[idx3 * 2];
      const v3 = uvAttribute.array[idx3 * 2 + 1];
  
      // Calculate center of the triangle in UV space
      const uCenter = (u1 + u2 + u3) / 3;
      const vCenter = (v1 + v2 + v3) / 3;
  
      // Convert to canvas coordinates
      const x = Math.floor(uCenter * canvas.width);
      const y = Math.floor(vCenter * canvas.height);
  
      // Sample color at this point
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
  
      // Store color in sRGB space (keeping the original values)
      triangleColors.push({
        r: pixelData[0],
        g: pixelData[1],
        b: pixelData[2],
        a: pixelData[3]
      });
    }
  
    // Group triangles by similar colors
    const segments: number[][] = [];
    const processedTriangles = new Set<number>();
  
    // Color distance function (using sRGB values 0-255)
    const colorDistance = (c1: any, c2: any) => {
      return (
        Math.sqrt(
          Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2) +
            Math.pow(c1.a - c2.a, 2)
        ) / 255
      ); // Normalize to 0-1 range for threshold comparison
    };
  
    // Process each triangle
    for (let i = 0; i < triangleCount; i++) {
      if (processedTriangles.has(i)) continue;
  
      const segment: number[] = [i];
      processedTriangles.add(i);
      const baseColor = triangleColors[i];
  
      // Find connected triangles with similar colors using BFS
      const queue: number[] = [i];
      while (queue.length > 0) {
        const currentTriangle = queue.shift()!;
  
        // Check all triangles for similarity
        for (let j = 0; j < triangleCount; j++) {
          if (processedTriangles.has(j)) continue;
  
          // Check if colors are similar
          if (colorDistance(baseColor, triangleColors[j]) <= options.colorThreshold) {
            // Add to segment and queue
            segment.push(j);
            queue.push(j);
            processedTriangles.add(j);
          }
        }
      }
  
      // Only add segments that meet the minimum size
      if (segment.length >= options.minSegmentSize) {
        segments.push(segment);
      } else {
        // Add small segments to the nearest larger segment
        if (segments.length > 0) {
          let nearestSegment = 0;
          let minDistance = Infinity;
  
          for (let s = 0; s < segments.length; s++) {
            const distance = colorDistance(baseColor, triangleColors[segments[s][0]]);
            if (distance < minDistance) {
              minDistance = distance;
              nearestSegment = s;
            }
          }
  
          segments[nearestSegment].push(...segment);
        } else {
          // If no segments exist yet, keep this one anyway
          segments.push(segment);
        }
      }
    }
  
    // Create a mesh for each segment
    const segmentMeshes: THREE.Mesh[] = [];
  
    for (let s = 0; s < segments.length; s++) {
      const segmentTriangles = segments[s];
  
      // Create a new geometry for this segment
      const segmentGeometry = new THREE.BufferGeometry();
  
      // Calculate the average color for this segment
      const avgColor = { r: 0, g: 0, b: 0, a: 0 };
      for (const triangleIndex of segmentTriangles) {
        avgColor.r += triangleColors[triangleIndex].r;
        avgColor.g += triangleColors[triangleIndex].g;
        avgColor.b += triangleColors[triangleIndex].b;
        avgColor.a += triangleColors[triangleIndex].a;
      }
      avgColor.r /= segmentTriangles.length;
      avgColor.g /= segmentTriangles.length;
      avgColor.b /= segmentTriangles.length;
      avgColor.a /= segmentTriangles.length;
  
      // Create arrays for the new geometry
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const newIndices: number[] = [];
  
      // Map original indices to new indices
      const indexMap = new Map<number, number>();
      let vertexCount = 0;
  
      // Add triangles to the new geometry
      for (const triangleIndex of segmentTriangles) {
        const indices = triangleIndices[triangleIndex];
  
        for (let i = 0; i < 3; i++) {
          const originalIndex = indices[i];
  
          if (!indexMap.has(originalIndex)) {
            // Add vertex data
            for (let j = 0; j < 3; j++) {
              positions.push(positionAttribute.array[originalIndex * 3 + j]);
            }
  
            // Add normal data if available
            if (geometry.attributes.normal) {
              for (let j = 0; j < 3; j++) {
                normals.push(geometry.attributes.normal.array[originalIndex * 3 + j]);
              }
            }
  
            // Add UV data
            uvs.push(uvAttribute.array[originalIndex * 2]);
            uvs.push(uvAttribute.array[originalIndex * 2 + 1]);
  
            // Map the original index to the new index
            indexMap.set(originalIndex, vertexCount);
            vertexCount++;
          }
  
          // Add the new index
          newIndices.push(indexMap.get(originalIndex)!);
        }
      }
  
      // Set attributes for the new geometry
      segmentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      if (normals.length > 0) {
        segmentGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      }
      segmentGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      segmentGeometry.setIndex(newIndices);
  
      // Compute normals if they weren't available
      if (normals.length === 0) {
        segmentGeometry.computeVertexNormals();
      }
  
      // Create material with the average color
      // Use CSS RGB string format to ensure proper color space conversion
      const rgbString = `rgb(${Math.round(avgColor.r)}, ${Math.round(avgColor.g)}, ${Math.round(avgColor.b)})`;
      const segmentMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(rgbString),
        transparent: avgColor.a < 255,
        opacity: avgColor.a / 255
      });
  
      // Create the segment mesh
      const segmentMesh = new THREE.Mesh(segmentGeometry, segmentMaterial);
      segmentMesh.name = `segment_${s}`;
  
      // Copy the transformation from the original mesh
      segmentMesh.position.copy(mesh.position);
      segmentMesh.rotation.copy(mesh.rotation);
      segmentMesh.scale.copy(mesh.scale);
  
      segmentMeshes.push(segmentMesh);
    }
  
    return segmentMeshes;
  }
  
  // Export the segmentMeshByTextureColor function
  export { segmentMeshByTextureColor };

  

/**
 * Draws a mesh's texture to a canvas element
 * @param {THREE.Mesh} mesh - The mesh to draw
 * @param {HTMLCanvasElement} canvasElement - The canvas to draw to
 * @param {Object} options - Drawing options
 * @returns {HTMLCanvasElement} The canvas element with the texture drawn
 */
function drawMeshTextureToCanvas(
    mesh:any,
    canvasElement:any,
    options = {
        resolution: 1024,
        wireframe: true,
        fillColor: 'rgba(200, 200, 200, 0.2)',
        wireframeColor: 'rgba(0, 0, 0, 0.8)',
        wireframeWidth: 1,
        background: 'white',
        showTexture: true
    }
) {
    // Make sure the mesh has UV coordinates
    const geometry = mesh.geometry;
    if (!geometry.attributes.uv) {
        console.error('Mesh does not have UV coordinates');
        return;
    }

    // Set up the canvas
    const canvas = canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context from canvas');
        return;
    }

    // Set canvas dimensions
    canvas.width = options.resolution;
    canvas.height = options.resolution;

    // Clear canvas with background color
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // First, try to render the texture if it exists and option is enabled
    let textureRendered = false;
    if (options.showTexture && mesh.material) {
        let material;

        // Handle array of materials
        if (Array.isArray(mesh.material)) {
            material = mesh.material[0];
        } else {
            material = mesh.material;
        }

        // Check for texture map in various material types
        let textureMap = null;
        if ('map' in material && material.map) {
            textureMap = material.map;
        }

        if (textureMap && textureMap.image) {
            // Draw the texture directly without flipping
            ctx.drawImage(
                textureMap.image,
                0,
                0,
                textureMap.image.width,
                textureMap.image.height,
                0,
                0,
                canvas.width,
                canvas.height
            );
            textureRendered = true;

            // If you're using this canvas as a texture later, set flipY to false
            // This would be done when creating a new texture from this canvas
            // const newTexture = new THREE.Texture(canvas);
            // newTexture.flipY = false;
        }
    }

    // If no texture was rendered, fill with background
    if (!textureRendered && options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Get UV coordinates and indices
    const uvAttribute = geometry.attributes.uv;
    const indices = geometry.index ? geometry.index.array : null;
    const triangleCount = indices ? indices.length / 3 : geometry.attributes.position.count / 3;

    // Draw triangles in UV space
    ctx.strokeStyle = options.wireframeColor;
    ctx.lineWidth = options.wireframeWidth;

    for (let i = 0; i < triangleCount; i++) {
        let idx1, idx2, idx3;

        if (indices) {
            // Indexed geometry
            idx1 = indices[i * 3];
            idx2 = indices[i * 3 + 1];
            idx3 = indices[i * 3 + 2];
        } else {
            // Non-indexed geometry
            idx1 = i * 3;
            idx2 = i * 3 + 1;
            idx3 = i * 3 + 2;
        }

        // Get UV coordinates for each vertex of the triangle
        const u1 = uvAttribute.array[idx1 * 2];
        const v1 = uvAttribute.array[idx1 * 2 + 1];
        const u2 = uvAttribute.array[idx2 * 2];
        const v2 = uvAttribute.array[idx2 * 2 + 1];
        const u3 = uvAttribute.array[idx3 * 2];
        const v3 = uvAttribute.array[idx3 * 2 + 1];

        // Convert UV coordinates to canvas coordinates
        // Use v directly without flipping
        const x1 = u1 * canvas.width;
        const y1 = v1 * canvas.height;
        const x2 = u2 * canvas.width;
        const y2 = v2 * canvas.height;
        const x3 = u3 * canvas.width;
        const y3 = v3 * canvas.height;

        // Draw the triangle
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();

        // Fill the triangle with semi-transparent color if needed
        if (options.fillColor) {
            ctx.fillStyle = options.fillColor;
            ctx.fill();
        }

        // Draw wireframe if enabled
        if (options.wireframe) {
            ctx.stroke();
        }
    }
    return canvas;
}

export { drawMeshTextureToCanvas };