"use client";

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import AddBook from './AddBook';
import EditBook from './EditBook';
import { Book, Category, Tag } from '../interfaces/Book';
import Actions from './Actions';

const BookList: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/books.json');
            const data = await response.json();
            setCategories(data.categories);
            setTags(data.tags);

            const storedBooks = localStorage.getItem('books');
            if (storedBooks) {
                setBooks(JSON.parse(storedBooks));
            } else {
                setBooks(data.books);
            }
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

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (bookId: number) => {
        const book = books.find(book => book.id === bookId);
        if (book) {
            setBookToEdit(book);
            setIsEditModalOpen(true);
            console.log("Editing book:", book);
        }
    };

    const handleOpenDeleteModal = (bookId: number) => {
        const book = books.find(book => book.id === bookId);
        if (book) {
            setBookToDelete(book);
            setIsDeleteModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setBookToDelete(null);
        setBookToEdit(null);
    };

    const handleDeleteBook = () => {
        if (bookToDelete) {
            const updatedBooks = books.filter(book => book.id !== bookToDelete.id);
            setBooks(updatedBooks);
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            handleCloseModal();
        }
    };

    const handleAddBook = (newBook: Book) => {
        const updatedBooks = [...books, newBook];
        setBooks(updatedBooks);
        localStorage.setItem('books', JSON.stringify(updatedBooks));
    };

    const handleEditBook = (updatedBook: Book) => {
        const updatedBooks = books.map(book => (book.id === updatedBook.id ? updatedBook : book));
        setBooks(updatedBooks);
        localStorage.setItem('books', JSON.stringify(updatedBooks));
        handleCloseModal();
    };

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title', width: 150 },
        { field: 'author', headerName: 'Author', width: 150 },
        { field: 'genre', headerName: 'Genre', width: 150 },
        { field: 'rating', headerName: 'Personal Rating', width: 150, type: 'number' },
        { field: 'categories', headerName: 'Categories', width: 200 },
        { field: 'tags', headerName: 'Tags', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Actions
                    bookId={params.row.id}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                />
            ),
        },
    ];

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
            <Button variant="contained" color="primary" onClick={handleOpenAddModal} style={{ marginTop: 20 }}>
                Add Book
            </Button>
            <AddBook
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                onAddBook={handleAddBook}
                categories={categories}
                tags={tags}
                nextId={books.length + 1}
            />
            {bookToEdit && (
                <EditBook
                    isOpen={isEditModalOpen}
                    onClose={handleCloseModal}
                    onEditBook={handleEditBook}
                    categories={categories}
                    tags={tags}
                    initialBook={bookToEdit}
                />
            )}
            <Dialog open={isDeleteModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this book?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteBook} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default BookList;