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

function createSegmentedMesh(mesh:any, options = {}) {
  const {
    scene,
    viewType = 4,
    polygonsPerMesh = 1000,
    gridDivisionsX = 4,
    gridDivisionsY = 4,
    gridDivisionsZ = 4,
    onProgress = () => {}
  } = options;

  const geometry = mesh.geometry;
  console.log(geometry);

  // Get the number of triangles (polygons)
  const triangleCount = geometry.index
    ? geometry.index.count / 3
    : geometry.attributes.position.count / 3;

  onProgress({ totalTriangles: triangleCount });

  // Compute bounding box
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  // Determine how many divisions we need in each axis to get roughly the amount of polygons per mesh
  const totalVolume = size.x * size.y * size.z;
  const volumePerMesh = totalVolume / (triangleCount / polygonsPerMesh);
  const divisionLength = Math.pow(volumePerMesh, 1 / 3);

  const divisionsX = gridDivisionsX;
  const divisionsY = gridDivisionsY;
  const divisionsZ = gridDivisionsZ;

  // Create an array to hold polygons for each cell
  const cells = Array(divisionsX * divisionsY * divisionsZ)
    .fill(null)
    .map(() => []);

  // Assign each polygon to a cell based on its centroid
  const positionAttr = geometry.attributes.position;
  const indices = geometry.index ? geometry.index.array : null;

  for (let i = 0; i < triangleCount; i++) {
    // Get the three vertices of this triangle
    let v1, v2, v3;

    if (indices) {
      const idx1 = indices[i * 3] * 3;
      const idx2 = indices[i * 3 + 1] * 3;
      const idx3 = indices[i * 3 + 2] * 3;

      v1 = new THREE.Vector3(
        positionAttr.array[idx1],
        positionAttr.array[idx1 + 1],
        positionAttr.array[idx1 + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx2],
        positionAttr.array[idx2 + 1],
        positionAttr.array[idx2 + 2]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx3],
        positionAttr.array[idx3 + 1],
        positionAttr.array[idx3 + 2]
      );
    } else {
      const idx = i * 9;

      v1 = new THREE.Vector3(
        positionAttr.array[idx],
        positionAttr.array[idx + 1],
        positionAttr.array[idx + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx + 3],
        positionAttr.array[idx + 4],
        positionAttr.array[idx + 5]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx + 6],
        positionAttr.array[idx + 7],
        positionAttr.array[idx + 8]
      );
    }

    // Apply mesh transformation
    v1.applyMatrix4(mesh.matrixWorld);
    v2.applyMatrix4(mesh.matrixWorld);
    v3.applyMatrix4(mesh.matrixWorld);

    // Calculate centroid
    const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);

    // Determine which cell this triangle belongs to
    const cellX = Math.min(
      divisionsX - 1,
      Math.max(0, Math.floor(((centroid.x - boundingBox.min.x) / size.x) * divisionsX))
    );
    const cellY = Math.min(
      divisionsY - 1,
      Math.max(0, Math.floor(((centroid.y - boundingBox.min.y) / size.y) * divisionsY))
    );
    const cellZ = Math.min(
      divisionsZ - 1,
      Math.max(0, Math.floor(((centroid.z - boundingBox.min.z) / size.z) * divisionsZ))
    );

    const cellIndex = cellX + cellY * divisionsX + cellZ * divisionsX * divisionsY;
    cells[cellIndex].push(i);
  }

  // Create meshes for each non-empty cell
  const smallMeshes = [];

  for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
    const triangles = cells[cellIndex];

    if (triangles.length === 0) continue;

    // Create a new geometry for this cell
    const cellGeometry = new THREE.BufferGeometry();

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
        cellGeometry.setAttribute(name, newAttributes[name]);
      }

      cellGeometry.setIndex(newIndices);
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
      cellGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(newPositions), 3)
      );

      // Set other attributes
      for (const name in newAttributes) {
        if (name === 'position') continue;

        const attribute = geometry.attributes[name];
        cellGeometry.setAttribute(
          name,
          new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
        );
      }
    }

    // Create a color based on the cell index using HSL
    const hue = (cellIndex * 137.5) % 360; // Golden angle approximation for good distribution
    const saturation = 0.85;
    const lightness = 0.5;
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    const cellMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.7
    });

    // Create a new mesh
    const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
    cellMesh.geometry.computeVertexNormals();
    cellMesh.material.needsUpdate = true;

    if (viewType != 4) {
      cellMesh.visible = false;
    }
    smallMeshes.push(cellMesh);
    
    if (scene) {
      scene.add(cellMesh);
    }
  }

  return smallMeshes;
}

// Export the function
export { createSegmentedMesh };

function createHexagonalSegmentation(mesh, options = {}) {
  const {
    scene,
    viewType = 6,
    hexPolygonCount = 1000,
    onProgress = () => {}
  } = options;

  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const indices = geometry.index ? geometry.index.array : null;

  // Get triangle count
  const triangleCount = geometry.index
    ? geometry.index.count / 3
    : geometry.attributes.position.count / 3;

  onProgress({ totalTriangles: triangleCount });

  // Build adjacency information
  const adjacencyList = buildAdjacencyList(geometry);

  // Calculate triangle centroids for distance calculations
  const triangleCentroids = [];
  for (let i = 0; i < triangleCount; i++) {
    let v1, v2, v3;

    if (indices) {
      const idx1 = indices[i * 3] * 3;
      const idx2 = indices[i * 3 + 1] * 3;
      const idx3 = indices[i * 3 + 2] * 3;

      v1 = new THREE.Vector3(
        positionAttr.array[idx1],
        positionAttr.array[idx1 + 1],
        positionAttr.array[idx1 + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx2],
        positionAttr.array[idx2 + 1],
        positionAttr.array[idx2 + 2]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx3],
        positionAttr.array[idx3 + 1],
        positionAttr.array[idx3 + 2]
      );
    } else {
      const idx = i * 9;

      v1 = new THREE.Vector3(
        positionAttr.array[idx],
        positionAttr.array[idx + 1],
        positionAttr.array[idx + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx + 3],
        positionAttr.array[idx + 4],
        positionAttr.array[idx + 5]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx + 6],
        positionAttr.array[idx + 7],
        positionAttr.array[idx + 8]
      );
    }

    // Apply mesh transformation
    v1.applyMatrix4(mesh.matrixWorld);
    v2.applyMatrix4(mesh.matrixWorld);
    v3.applyMatrix4(mesh.matrixWorld);

    // Calculate centroid
    const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
    triangleCentroids.push(centroid);
  }

  // Keep track of which triangles have been processed
  const processedTriangles = new Set();

  // Create hexagonal groups
  const hexGroups = [];

  // Calculate the target number of segments based on total triangles and hexPolygonCount
  const targetSegmentCount = Math.max(1, Math.ceil(triangleCount / hexPolygonCount));
  console.log(
    `Target segment count: ${targetSegmentCount}, Total triangles: ${triangleCount}, Polygons per segment: ${hexPolygonCount}`
  );

  // Process triangles to form hexagons by selecting random starting points
  while (processedTriangles.size < triangleCount) {
    // Get all unprocessed triangles
    const unprocessedTriangles = [];
    for (let i = 0; i < triangleCount; i++) {
      if (!processedTriangles.has(i)) {
        unprocessedTriangles.push(i);
      }
    }

    if (unprocessedTriangles.length === 0) break;

    // Select a random unprocessed triangle as the starting point
    const randomIndex = Math.floor(Math.random() * unprocessedTriangles.length);
    const startTriangle = unprocessedTriangles[randomIndex];

    // Start a new hexagon with this triangle
    const hexGroup = [startTriangle];
    processedTriangles.add(startTriangle);

    // Use an enhanced breadth-first search to add adjacent triangles
    const queue = [...adjacencyList[startTriangle]];
    const visited = new Set([startTriangle]);

    // Create a distance map to prioritize triangles closer to the start
    const distanceMap = new Map();
    adjacencyList[startTriangle].forEach((neighbor) => {
      distanceMap.set(neighbor, 1);
    });

    // Continue adding triangles until we reach the desired size or run out of connected triangles
    while (hexGroup.length < hexPolygonCount && queue.length > 0) {
      // Sort queue by distance to prioritize closer triangles
      queue.sort((a, b) => (distanceMap.get(a) || Infinity) - (distanceMap.get(b) || Infinity));

      const nextTriangle = queue.shift();

      // Skip if already processed or visited
      if (processedTriangles.has(nextTriangle) || visited.has(nextTriangle)) continue;

      visited.add(nextTriangle);
      hexGroup.push(nextTriangle);
      processedTriangles.add(nextTriangle);

      // Add neighbors to the queue with updated distances
      for (const neighbor of adjacencyList[nextTriangle]) {
        if (!visited.has(neighbor) && !processedTriangles.has(neighbor)) {
          const currentDist = distanceMap.get(nextTriangle) || 0;
          distanceMap.set(neighbor, currentDist + 1);

          // Only add to queue if not already there
          if (!queue.includes(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }

    // If we couldn't find enough connected triangles, try to add more from unprocessed triangles
    if (hexGroup.length < hexPolygonCount) {
      // Find unprocessed triangles that are closest to any triangle in the current group
      const remainingNeeded = hexPolygonCount - hexGroup.length;
      const candidates = [];

      for (let i = 0; i < triangleCount; i++) {
        if (!processedTriangles.has(i)) {
          // Find minimum distance to any triangle in the current group
          let minDist = Infinity;
          for (const groupTriangle of hexGroup) {
            const dist = triangleCentroids[i].distanceTo(triangleCentroids[groupTriangle]);
            minDist = Math.min(minDist, dist);
          }
          candidates.push({ triangle: i, distance: minDist });
        }
      }

      // Sort candidates by distance and add the closest ones
      candidates.sort((a, b) => a.distance - b.distance);
      for (let i = 0; i < Math.min(remainingNeeded, candidates.length); i++) {
        hexGroup.push(candidates[i].triangle);
        processedTriangles.add(candidates[i].triangle);
      }
    }

    // Only add non-empty groups
    if (hexGroup.length > 0) {
      hexGroups.push(hexGroup);
    }

    // If we've created enough segments, break out of the loop
    if (
      hexGroups.length >= targetSegmentCount &&
      processedTriangles.size >= triangleCount * 0.95
    ) {
      break;
    }
  }

  console.log(
    `Created ${hexGroups.length} segments with an average of ${processedTriangles.size / hexGroups.length} triangles per segment`
  );

  // Create meshes for each hexagon group
  const hexMeshes = [];
  for (let groupIndex = 0; groupIndex < hexGroups.length; groupIndex++) {
    const triangles = hexGroups[groupIndex];

    if (triangles.length === 0) continue;

    // Create a new geometry for this hexagon
    const hexGeometry = new THREE.BufferGeometry();

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
        hexGeometry.setAttribute(name, newAttributes[name]);
      }

      hexGeometry.setIndex(newIndices);
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
      hexGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(newPositions), 3)
      );

      // Set other attributes
      for (const name in newAttributes) {
        if (name === 'position') continue;

        const attribute = geometry.attributes[name];
        hexGeometry.setAttribute(
          name,
          new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
        );
      }
    }

    // Create a color based on the group index
    const hue = (groupIndex * 137.5) % 360; // Golden angle for good distribution
    const saturation = 0.85;
    const lightness = 0.5;
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    const hexMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.7
    });

    // Create a new mesh
    const hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);
    hexMesh.geometry.computeVertexNormals();
    hexMesh.material.needsUpdate = true;

    if (viewType != 6) {
      hexMesh.visible = false;
    }

    hexMeshes.push(hexMesh);
    
    if (scene) {
      scene.add(hexMesh);
    }
  }

  return hexMeshes;
}

// Export the function
export { createHexagonalSegmentation };

function buildAdjacencyList(geometry) {
  const indices = geometry.index ? geometry.index.array : null;
  const triangleCount = indices
    ? Math.floor(indices.length / 3)
    : Math.floor(geometry.attributes.position.count / 3);

  // Validate triangleCount
  if (triangleCount <= 0 || !Number.isInteger(triangleCount)) {
    console.error('Invalid triangle count:', triangleCount);
    return [];
  }

  // Create adjacency list
  const adjacencyList = Array(triangleCount)
    .fill()
    .map(() => []);

  // Build edge to triangle map
  const edgeToTriangle = new Map();

  for (let i = 0; i < triangleCount; i++) {
    // Get the three vertices of this triangle
    let v1, v2, v3;

    if (indices) {
      v1 = indices[i * 3];
      v2 = indices[i * 3 + 1];
      v3 = indices[i * 3 + 2];
    } else {
      v1 = i * 3;
      v2 = i * 3 + 1;
      v3 = i * 3 + 2;
    }

    // Create the three edges (ensure consistent ordering)
    const edge1 = [Math.min(v1, v2), Math.max(v1, v2)].toString();
    const edge2 = [Math.min(v2, v3), Math.max(v2, v3)].toString();
    const edge3 = [Math.min(v3, v1), Math.max(v3, v1)].toString();

    // For each edge, find triangles that share it
    for (const edge of [edge1, edge2, edge3]) {
      if (edgeToTriangle.has(edge)) {
        const otherTriangle = edgeToTriangle.get(edge);
        // Add bidirectional adjacency
        adjacencyList[i].push(otherTriangle);
        adjacencyList[otherTriangle].push(i);
      } else {
        edgeToTriangle.set(edge, i);
      }
    }
  }

  return adjacencyList;
}

export { buildAdjacencyList }


function createStripedSegmentation(mesh, options = {}) {
  const {
    scene,
    viewType = 7,
    stripePolygonCount = 1000,
    onProgress = () => {}
  } = options;

  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const indices = geometry.index ? geometry.index.array : null;

  // Get triangle count
  const triangleCount = geometry.index
    ? geometry.index.count / 3
    : geometry.attributes.position.count / 3;

  onProgress({ totalTriangles: triangleCount });

  // Build adjacency information
  const adjacencyList = buildAdjacencyList(geometry);

  // Calculate triangle centroids for distance calculations
  const triangleCentroids = [];
  for (let i = 0; i < triangleCount; i++) {
    let v1, v2, v3;

    if (indices) {
      const idx1 = indices[i * 3] * 3;
      const idx2 = indices[i * 3 + 1] * 3;
      const idx3 = indices[i * 3 + 2] * 3;

      v1 = new THREE.Vector3(
        positionAttr.array[idx1],
        positionAttr.array[idx1 + 1],
        positionAttr.array[idx1 + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx2],
        positionAttr.array[idx2 + 1],
        positionAttr.array[idx2 + 2]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx3],
        positionAttr.array[idx3 + 1],
        positionAttr.array[idx3 + 2]
      );
    } else {
      const idx = i * 9;

      v1 = new THREE.Vector3(
        positionAttr.array[idx],
        positionAttr.array[idx + 1],
        positionAttr.array[idx + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx + 3],
        positionAttr.array[idx + 4],
        positionAttr.array[idx + 5]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx + 6],
        positionAttr.array[idx + 7],
        positionAttr.array[idx + 8]
      );
    }

    // Apply mesh transformation
    v1.applyMatrix4(mesh.matrixWorld);
    v2.applyMatrix4(mesh.matrixWorld);
    v3.applyMatrix4(mesh.matrixWorld);

    // Calculate centroid
    const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
    triangleCentroids.push(centroid);
  }

  // Keep track of which triangles have been processed
  const processedTriangles = new Set();

  // Create hexagonal groups
  const hexGroups = [];

  // Calculate the target number of segments based on total triangles and stripePolygonCount
  const targetSegmentCount = Math.max(1, Math.ceil(triangleCount / stripePolygonCount));
  console.log(
    `Target segment count: ${targetSegmentCount}, Total triangles: ${triangleCount}, Polygons per segment: ${stripePolygonCount}`
  );

  // Sort triangles by height (y-coordinate) to start from the top
  const trianglesByHeight = [];
  for (let i = 0; i < triangleCount; i++) {
    trianglesByHeight.push({
      index: i,
      y: triangleCentroids[i].y
    });
  }
  trianglesByHeight.sort((a, b) => b.y - a.y); // Sort in descending order (highest first)

  // Process triangles to form segments in a top-to-bottom flow
  while (processedTriangles.size < triangleCount) {
    // Find the highest unprocessed triangle
    let startTriangle = -1;
    for (const triangle of trianglesByHeight) {
      if (!processedTriangles.has(triangle.index)) {
        startTriangle = triangle.index;
        break;
      }
    }

    if (startTriangle === -1) break; // No more unprocessed triangles

    // Start a new segment with this triangle
    const hexGroup = [startTriangle];
    processedTriangles.add(startTriangle);

    // Keep track of the current triangle
    let currentTriangle = startTriangle;
    let currentY = triangleCentroids[currentTriangle].y;

    // Continue adding triangles until we reach the desired size
    while (hexGroup.length < stripePolygonCount) {
      // Find adjacent triangles that are lower than the current one
      const lowerNeighbors = [];
      for (const neighbor of adjacencyList[currentTriangle]) {
        if (!processedTriangles.has(neighbor)) {
          const neighborY = triangleCentroids[neighbor].y;
          if (neighborY < currentY) {
            lowerNeighbors.push({
              index: neighbor,
              y: neighborY,
              distance: triangleCentroids[currentTriangle].distanceTo(triangleCentroids[neighbor])
            });
          }
        }
      }

      // If no lower neighbors, try any unprocessed adjacent neighbors
      if (lowerNeighbors.length === 0) {
        for (const neighbor of adjacencyList[currentTriangle]) {
          if (!processedTriangles.has(neighbor)) {
            lowerNeighbors.push({
              index: neighbor,
              y: triangleCentroids[neighbor].y,
              distance: triangleCentroids[currentTriangle].distanceTo(triangleCentroids[neighbor])
            });
          }
        }
      }

      // If still no neighbors, find the closest unprocessed triangle
      if (lowerNeighbors.length === 0) {
        let closestUnprocessed = null;
        let minDistance = Infinity;

        for (let i = 0; i < triangleCount; i++) {
          if (!processedTriangles.has(i)) {
            const dist = triangleCentroids[currentTriangle].distanceTo(triangleCentroids[i]);
            if (dist < minDistance) {
              minDistance = dist;
              closestUnprocessed = i;
            }
          }
        }

        if (closestUnprocessed !== null) {
          lowerNeighbors.push({
            index: closestUnprocessed,
            y: triangleCentroids[closestUnprocessed].y,
            distance: minDistance
          });
        } else {
          // No more triangles to process
          break;
        }
      }

      // Sort neighbors by y-coordinate (lowest first) and then by distance (closest first)
      lowerNeighbors.sort((a, b) => {
        // Prioritize lower triangles
        if (a.y !== b.y) {
          return a.y - b.y;
        }
        // If same height, prioritize closest
        return a.distance - b.distance;
      });

      // Add the best neighbor to our group
      const nextTriangle = lowerNeighbors[0].index;
      hexGroup.push(nextTriangle);
      processedTriangles.add(nextTriangle);

      // Update current triangle and its y-coordinate
      currentTriangle = nextTriangle;
      currentY = triangleCentroids[currentTriangle].y;

      // If we've reached the target size, break out
      if (hexGroup.length >= stripePolygonCount) {
        break;
      }
    }

    // Only add non-empty groups
    if (hexGroup.length > 0) {
      hexGroups.push(hexGroup);
    }

    // If we've created enough segments, continue but don't break out
    // This ensures we process all triangles
  }

  // If there are still unprocessed triangles, add them to the last group or create new groups
  if (processedTriangles.size < triangleCount) {
    const remainingTriangles = [];
    for (let i = 0; i < triangleCount; i++) {
      if (!processedTriangles.has(i)) {
        remainingTriangles.push(i);
      }
    }

    // Create new groups with the remaining triangles
    while (remainingTriangles.length > 0) {
      const newGroup = [];
      const groupSize = Math.min(stripePolygonCount, remainingTriangles.length);

      for (let i = 0; i < groupSize; i++) {
        newGroup.push(remainingTriangles.shift());
      }

      hexGroups.push(newGroup);
    }
  }

  console.log(
    `Created ${hexGroups.length} segments with an average of ${processedTriangles.size / hexGroups.length} triangles per segment`
  );

  // Create meshes for each hexagon group
  const stripeMeshes = [];
  for (let groupIndex = 0; groupIndex < hexGroups.length; groupIndex++) {
    const triangles = hexGroups[groupIndex];

    if (triangles.length === 0) continue;

    // Create a new geometry for this hexagon
    const hexGeometry = new THREE.BufferGeometry();

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
        hexGeometry.setAttribute(name, newAttributes[name]);
      }

      hexGeometry.setIndex(newIndices);
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
      hexGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(newPositions), 3)
      );

      // Set other attributes
      for (const name in newAttributes) {
        if (name === 'position') continue;

        const attribute = geometry.attributes[name];
        hexGeometry.setAttribute(
          name,
          new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
        );
      }
    }

    // Create a color based on the group index
    const hue = (groupIndex * 137.5) % 360; // Golden angle for good distribution
    const saturation = 0.85;
    const lightness = 0.5;
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    const hexMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.7
    });

    // Create a new mesh
    const hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);
    hexMesh.geometry.computeVertexNormals();
    hexMesh.material.needsUpdate = true;

    if (viewType != 7) {
      hexMesh.visible = false;
    }

    stripeMeshes.push(hexMesh);
    
    if (scene) {
      scene.add(hexMesh);
    }
  }

  return stripeMeshes;
}

// Export the function
export { createStripedSegmentation };


function createNormalBasedSegmentation(mesh, options = {}) {
  const {
    scene,
    viewType = 8,
    angleThreshold = 20,
    onProgress = () => {}
  } = options;

  const geometry = mesh.geometry;

  // Get the number of triangles
  const triangleCount = geometry.index
    ? geometry.index.count / 3
    : geometry.attributes.position.count / 3;

  onProgress({ totalTriangles: triangleCount });

  // Build adjacency list
  const adjacencyList = buildAdjacencyList(geometry);

  // Calculate normals for each triangle
  const triangleNormals = calculateTriangleNormals(geometry);

  // Convert angle threshold to radians
  const thresholdRadians = (angleThreshold * Math.PI) / 180;

  // Create regions by merging triangles with similar normals
  const regions = [];
  const assignedTriangles = new Set();

  // Iterative triangle merging
  for (let i = 0; i < triangleCount; i++) {
    if (assignedTriangles.has(i)) continue;

    // Start a new region with this triangle
    const region = [i];
    assignedTriangles.add(i);

    // Use a queue for region growing
    const queue = [i];

    while (queue.length > 0) {
      const currentTriangle = queue.shift();
      const currentNormal = triangleNormals[currentTriangle];

      // Check all adjacent triangles
      for (const adjacentTriangle of adjacencyList[currentTriangle]) {
        if (assignedTriangles.has(adjacentTriangle)) continue;

        const adjacentNormal = triangleNormals[adjacentTriangle];

        // Calculate angle between normals
        const angle = Math.acos(Math.min(1, Math.max(-1, currentNormal.dot(adjacentNormal))));

        // If angle is below threshold, add to region
        if (angle < thresholdRadians) {
          region.push(adjacentTriangle);
          assignedTriangles.add(adjacentTriangle);
          queue.push(adjacentTriangle);
        }
      }
    }

    regions.push(region);
  }

  // Create meshes for each region
  const normalMeshes = createMeshesFromRegions(mesh, geometry, regions, scene);

  return normalMeshes;
}

// Helper function to calculate triangle normals
function calculateTriangleNormals(geometry) {
  const positionAttr = geometry.attributes.position;
  const indices = geometry.index ? geometry.index.array : null;
  const triangleCount = indices ? indices.length / 3 : positionAttr.count / 3;

  const normals = [];

  for (let i = 0; i < triangleCount; i++) {
    let v1, v2, v3;

    if (indices) {
      const idx1 = indices[i * 3] * 3;
      const idx2 = indices[i * 3 + 1] * 3;
      const idx3 = indices[i * 3 + 2] * 3;

      v1 = new THREE.Vector3(
        positionAttr.array[idx1],
        positionAttr.array[idx1 + 1],
        positionAttr.array[idx1 + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx2],
        positionAttr.array[idx2 + 1],
        positionAttr.array[idx2 + 2]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx3],
        positionAttr.array[idx3 + 1],
        positionAttr.array[idx3 + 2]
      );
    } else {
      const idx = i * 9;

      v1 = new THREE.Vector3(
        positionAttr.array[idx],
        positionAttr.array[idx + 1],
        positionAttr.array[idx + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx + 3],
        positionAttr.array[idx + 4],
        positionAttr.array[idx + 5]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx + 6],
        positionAttr.array[idx + 7],
        positionAttr.array[idx + 8]
      );
    }

    // Calculate triangle normal
    const edge1 = new THREE.Vector3().subVectors(v2, v1);
    const edge2 = new THREE.Vector3().subVectors(v3, v1);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

    normals.push(normal);
  }

  return normals;
}

// Function to create meshes from regions
function createMeshesFromRegions(mesh, geometry, regions, scene) {
  const segmentedMeshes = [];
  const positionAttr = geometry.attributes.position;
  const indices = geometry.index ? geometry.index.array : null;

  regions.forEach((triangles, regionIndex) => {
    // Create a new geometry for this region
    const regionGeometry = new THREE.BufferGeometry();

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
        regionGeometry.setAttribute(name, newAttributes[name]);
      }

      regionGeometry.setIndex(newIndices);
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
      regionGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(newPositions), 3)
      );

      // Set other attributes
      for (const name in newAttributes) {
        if (name === 'position') continue;

        const attribute = geometry.attributes[name];
        regionGeometry.setAttribute(
          name,
          new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
        );
      }
    }

    // Create a color based on the region index using HSL
    const hue = (regionIndex * 137.5) % 360; // Golden angle for good distribution
    const saturation = 0.85;
    const lightness = 0.5;
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    const regionMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.7
    });

    // Create a new mesh
    const regionMesh = new THREE.Mesh(regionGeometry, regionMaterial);
    regionMesh.geometry.computeVertexNormals();
    regionMesh.material.needsUpdate = true;

    segmentedMeshes.push(regionMesh);
    
    if (scene) {
      scene.add(regionMesh);
    }
  });

  return segmentedMeshes;
}

// Export the function
export { createNormalBasedSegmentation, createMeshesFromRegions, calculateTriangleNormals };

function mergeRegions(regions, triangleNormals, angleThreshold, adjacencyList) {
  const mergedRegions = [...regions];
  let changed = true;
  const thresholdRadians = (angleThreshold * Math.PI) / 180;

  // Calculate average normal for each region
  const regionNormals = mergedRegions.map((region) => {
    const avgNormal = new THREE.Vector3();
    region.forEach((triangleIndex) => {
      avgNormal.add(triangleNormals[triangleIndex]);
    });
    return avgNormal.normalize();
  });

  // Iteratively merge regions
  while (changed) {
    changed = false;

    // Find adjacent regions
    for (let i = 0; i < mergedRegions.length; i++) {
      if (!mergedRegions[i] || mergedRegions[i].length === 0) continue;

      for (let j = i + 1; j < mergedRegions.length; j++) {
        if (!mergedRegions[j] || mergedRegions[j].length === 0) continue;

        // Check if regions are adjacent
        const areAdjacent = checkRegionsAdjacency(
          mergedRegions[i],
          mergedRegions[j],
          adjacencyList
        );

        if (areAdjacent) {
          // Calculate angle between region normals
          const angle = Math.acos(
            Math.min(1, Math.max(-1, regionNormals[i].dot(regionNormals[j])))
          );

          // If angle is below threshold, merge regions
          if (angle < thresholdRadians) {
            // Merge j into i
            mergedRegions[i] = [...mergedRegions[i], ...mergedRegions[j]];
            mergedRegions[j] = [];

            // Recalculate normal for region i
            const avgNormal = new THREE.Vector3();
            mergedRegions[i].forEach((triangleIndex) => {
              avgNormal.add(triangleNormals[triangleIndex]);
            });
            regionNormals[i] = avgNormal.normalize();

            changed = true;
          }
        }
      }
    }
  }

  // Filter out empty regions
  return mergedRegions.filter((region) => region.length > 0);
}

function checkRegionsAdjacency(region1, region2, adjacencyList) {
  for (const triangle1 of region1) {
    for (const triangle2 of region2) {
      if (adjacencyList[triangle1].includes(triangle2)) {
        return true;
      }
    }
  }
  return false;
}

function generateRandomPointsInBoundingBox(boundingBox: any, numPoints: any) {
  const points = [];
  const min = boundingBox.min;
  const max = boundingBox.max;

  for (let i = 0; i < numPoints; i++) {
    const point = new THREE.Vector3(
      min.x + Math.random() * (max.x - min.x),
      min.y + Math.random() * (max.y - min.y),
      min.z + Math.random() * (max.z - min.z)
    );
    points.push(point);
  }

  return points;
}

function createVoronoiSegmentation(mesh, options = {}) {
  const {
    scene,
    viewType = 5,
    voronoiPointCount = 1000,
    onProgress = () => {}
  } = options;

  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const indices = geometry.index ? geometry.index.array : null;

  // Get the bounding box
  const boundingBox = new THREE.Box3().setFromObject(mesh);

  // Generate random points for Voronoi cells
  const voronoiPoints = generateRandomPointsInBoundingBox(boundingBox, voronoiPointCount);

  // Create cells for each Voronoi point
  const cells = Array(voronoiPoints.length)
    .fill()
    .map(() => []);

  // Get triangle count
  const triangleCount = geometry.index
    ? geometry.index.count / 3
    : geometry.attributes.position.count / 3;

  onProgress({ totalTriangles: triangleCount });

  // Assign each triangle to the closest Voronoi point
  for (let i = 0; i < triangleCount; i++) {
    // Get the three vertices of this triangle
    let v1, v2, v3;

    if (indices) {
      const idx1 = indices[i * 3] * 3;
      const idx2 = indices[i * 3 + 1] * 3;
      const idx3 = indices[i * 3 + 2] * 3;

      v1 = new THREE.Vector3(
        positionAttr.array[idx1],
        positionAttr.array[idx1 + 1],
        positionAttr.array[idx1 + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx2],
        positionAttr.array[idx2 + 1],
        positionAttr.array[idx2 + 2]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx3],
        positionAttr.array[idx3 + 1],
        positionAttr.array[idx3 + 2]
      );
    } else {
      const idx = i * 9;

      v1 = new THREE.Vector3(
        positionAttr.array[idx],
        positionAttr.array[idx + 1],
        positionAttr.array[idx + 2]
      );

      v2 = new THREE.Vector3(
        positionAttr.array[idx + 3],
        positionAttr.array[idx + 4],
        positionAttr.array[idx + 5]
      );

      v3 = new THREE.Vector3(
        positionAttr.array[idx + 6],
        positionAttr.array[idx + 7],
        positionAttr.array[idx + 8]
      );
    }

    // Apply mesh transformation
    v1.applyMatrix4(mesh.matrixWorld);
    v2.applyMatrix4(mesh.matrixWorld);
    v3.applyMatrix4(mesh.matrixWorld);

    // Calculate centroid
    const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);

    // Find closest Voronoi point
    let minDist = Infinity;
    let closestPointIndex = 0;

    for (let j = 0; j < voronoiPoints.length; j++) {
      const dist = centroid.distanceTo(voronoiPoints[j]);
      if (dist < minDist) {
        minDist = dist;
        closestPointIndex = j;
      }
    }

    // Assign triangle to the cell of the closest point
    cells[closestPointIndex].push(i);
  }

  // Create meshes for each non-empty cell
  const voronoiMeshes = [];

  for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
    const triangles = cells[cellIndex];

    if (triangles.length === 0) continue;

    // Create a new geometry for this cell
    const cellGeometry = new THREE.BufferGeometry();

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
        cellGeometry.setAttribute(name, newAttributes[name]);
      }

      cellGeometry.setIndex(newIndices);
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
      cellGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(newPositions), 3)
      );

      // Set other attributes
      for (const name in newAttributes) {
        if (name === 'position') continue;

        const attribute = geometry.attributes[name];
        cellGeometry.setAttribute(
          name,
          new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
        );
      }
    }

    // Create a color based on the cell index using HSL
    const hue = (cellIndex * 137.5) % 360; // Golden angle approximation for good distribution
    const saturation = 0.85;
    const lightness = 0.5;
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    const cellMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.7
    });

    // Create a new mesh
    const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
    cellMesh.geometry.computeVertexNormals();
    cellMesh.material.needsUpdate = true;

    if (viewType != 5) {
      cellMesh.visible = false;
    }

    voronoiMeshes.push(cellMesh);
    
    if (scene) {
      scene.add(cellMesh);
    }
  }

  return voronoiMeshes;
}

// Export the function
export { generateRandomPointsInBoundingBox, createVoronoiSegmentation };