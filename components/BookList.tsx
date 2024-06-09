
"use client";

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container } from '@mui/material';
import { Book, Category, Tag } from '../interfaces/Book';

const columns: GridColDef[] = [
  { field: 'title', headerName: 'Title', width: 150 },
  { field: 'author', headerName: 'Author', width: 150 },
  { field: 'genre', headerName: 'Genre', width: 150 },
  { field: 'rating', headerName: 'Personal Rating', width: 150, type: 'number' },
  { field: 'categories', headerName: 'Categories', width: 200 },
  { field: 'tags', headerName: 'Tags', width: 200 },
];

const BookListTable: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/books.json');
      const data = await response.json();
      setBooks(data.books);
      setCategories(data.categories);
      setTags(data.tags);
    };
    fetchData();
  }, []); 

  const getCategoryNames = (ids: number[]) => {
    return ids.map(id => categories.find(category => category.id === id.toString())?.name).join(', ');
  };

  const getTagNames = (ids: number[]) => {
    return ids.map(id => tags.find(tag => tag.id === id.toString())?.name).join(', ');
  };

  const rows = books.map(book => ({
    ...book,
    categories: getCategoryNames(book.categories),
    tags: getTagNames(book.tags)
  }));

  return (
    <Container>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
        />
      </div>
    </Container>
  );
};

export default BookListTable;
