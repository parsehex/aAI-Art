type TextureLayer = {
  type: 'circle' | 'rect' | 'line';
  color: string;
  x?: number;
  y?: number;
  x2?: number;  // End x coordinate for line
  y2?: number;  // End y coordinate for line
  width?: number;
  height?: number;
  radius?: number;
  lineWidth?: number;  // Optional line thickness
};

interface TextureDescription {
  size: number
  layers: TextureLayer[]
  name: string
}
