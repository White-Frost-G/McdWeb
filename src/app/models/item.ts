export enum ItemType {
  None = 0,
  Waste = 1 << 0,
  Frezzer = 1 << 1,
  Cooler = 1 << 2,
  Dry = 1 << 3,
  RawWaste = 1 << 4,
  EndWaste = 1 << 5
}

export enum UnitType {
  Item,
  Gram,
}

export enum StepperType {
  SmallCounter,
  NormalCounter,
  BigCounter,
  HugeCounter,
  Custom,
}

export interface CountOption {
  min: number;
  max: number;
  avg: number;
}

export interface Item {
  name: string;
  showName?: string;
  canBe: ItemType;
  unitType: UnitType;
  stepperType: StepperType;
  customStepper?: number[];
  tags: string[];
}
