export interface Book {
    id: number;
    title: string;
    author: string;
    genre: string;
    rating: number;
    categories: number[];
    tags: number[];
  }
  
  export interface Category {
    id: string;
    name: string;
  }
  
  export interface Tag {
    id: string;
    name: string;
  }
  