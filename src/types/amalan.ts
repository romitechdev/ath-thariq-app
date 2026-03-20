export type AmalanItem = {
  id: number;
  judul: string;
  kategori: string;
  isi_arab?: string;
  isi_latin: string;
  arti: string;
  sumber?: string | null;
  link_sumber?: string | null;
};