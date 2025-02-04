export const Zombie: TextureDescription = {
  name: "rotting-zombie",
  size: 64,
  layers: [
    // Base body color - sickly green
    {
      type: "rect",
      color: "#94a183",
      x: 16,
      y: 8,
      width: 32,
      height: 48
    },
    // Darker torso area
    {
      type: "rect",
      color: "#737b63",
      x: 20,
      y: 28,
      width: 24,
      height: 20
    },
    // Head shape
    {
      type: "circle",
      color: "#8b9677",
      x: 32,
      y: 16,
      radius: 8
    },
    // Left rotting eye socket
    {
      type: "circle",
      color: "#3d3f34",
      x: 28,
      y: 14,
      radius: 2
    },
    // Right empty eye socket
    {
      type: "circle",
      color: "#2a2b24",
      x: 36,
      y: 14,
      radius: 3
    },
    // Decaying mouth
    {
      type: "rect",
      color: "#2a2b24",
      x: 28,
      y: 18,
      width: 8,
      height: 3
    },
    // Left arm - decomposed
    {
      type: "rect",
      color: "#656b57",
      x: 12,
      y: 28,
      width: 8,
      height: 20
    },
    // Right arm
    {
      type: "rect",
      color: "#656b57",
      x: 44,
      y: 28,
      width: 8,
      height: 24
    },
    // Exposed bone patches
    {
      type: "circle",
      color: "#e8e4d9",
      x: 24,
      y: 36,
      radius: 3
    },
    {
      type: "circle",
      color: "#e8e4d9",
      x: 40,
      y: 42,
      radius: 2
    },
    // Blood stains
    {
      type: "circle",
      color: "#8b3f3f",
      x: 28,
      y: 32,
      radius: 4
    },
    {
      type: "circle",
      color: "#732525",
      x: 36,
      y: 46,
      radius: 3
    },
    // Torn flesh details
    {
      type: "line",
      color: "#5c6150",
      x: 20,
      y: 24,
      x2: 28,
      y2: 30,
      lineWidth: 2
    },
    {
      type: "line",
      color: "#5c6150",
      x: 36,
      y: 28,
      x2: 44,
      y2: 34,
      lineWidth: 2
    }
  ]
}
