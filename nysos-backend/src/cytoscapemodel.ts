import { ObjectDataInterface } from "./mongodefs";

type CytoscapeData = { id: string; [key: string]: any };

export interface CytoscapeJsObjectInterface {
  classes: string;
  data: CytoscapeData;
  grabbable: boolean;
  group: "nodes" | "edges";
  locked: boolean;
  pannable: boolean;
  position: { x: number; y: number };
  removed: boolean;
  selectable: boolean;
  selected: boolean;
}

export const fromDatabaseToCytoscapeObj = (
  data: ObjectDataInterface
): CytoscapeJsObjectInterface => {
  const id = data._id;
  const position = data.position || { x: 0, y: 0 };
  const group = data.target ? "edges" : "nodes";
  const data_: CytoscapeData = { ...data, id };
  delete data_._id;
  const classes = data.type;
  return {
    classes,
    data: data_,
    grabbable: true,
    group,
    locked: false,
    pannable: false,
    position,
    removed: false,
    selectable: true,
    selected: false,
  };
};
