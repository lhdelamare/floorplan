export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  curve?: number; // offset in cm perpendicular to the midpoint of the wall
  groupId?: string; // ID of the group if grouped (optional)
}

export interface CanvasItem {
  id: string;
  name: string;
  type: 'furniture' | 'door' | 'window' | 'text';
  x: number; // central X in cm
  y: number; // central Y in cm
  width: number; // width in cm
  depth: number; // depth/height in cm
  rotation: number; // angle in degrees
  color: string;
  icon: string; // e.g. 'refrigerator', 'sink', 'sofa', 'table', 'chair', 'bed', 'toilet', 'door', 'window', 'plant', 'tv', 'stairs', 'text'
  fontSize?: number; // font size for text item (optional)
  groupId?: string; // ID of the group if grouped (optional)
  flipX?: boolean; // mirror horizontally (optional)
  flipY?: boolean; // mirror vertically (optional)
}

export interface LayoutState {
  walls: Wall[];
  items: CanvasItem[];
}

export interface Floor {
  id: string;
  name: string;
  before: LayoutState;
  after: LayoutState;
}

export interface Project {
  name: string;
  floors: Floor[];
  customPresets?: Omit<CanvasItem, 'id' | 'x' | 'y' | 'rotation'>[];
}

export type EditorTool = 'select' | 'pan' | 'wall' | 'delete';
