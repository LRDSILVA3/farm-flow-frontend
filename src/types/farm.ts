export interface Plot {
  id: string;
  name: string;
  area: string;
  status: string;
  city: string;
  state: string;
  registration: string;
  lot: string;
}

export interface Farm {
  id: string;
  name: string;
  owner: string;
  area: string;
  city: string;
  state: string;
  contact: string;
  status: string;
  registration: string;
  lot: string;
  plots: Plot[];
}
