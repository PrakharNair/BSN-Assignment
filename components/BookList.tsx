"use client";

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Button, Dialog, DialogActions, DialogContent, DialogTitle, Chip, IconButton, TextField } from '@mui/material';
import AddBook from './AddBook';
import EditBook from './EditBook';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Book, Category, Tag } from '../interfaces/Book';
import Actions from './Actions';

const BookList: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
    const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [isAddingNewCategory, setIsAddingNewCategory] = useState<boolean>(false);
    const [newCategoryInput, setNewCategoryInput] = useState<string>("");
    const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
    const [newTagName, setNewTagName] = useState<string>("");
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);
    const [newTagInput, setNewTagInput] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            const storedCategories = localStorage.getItem('categories');
            const storedTags = localStorage.getItem('tags');
            const storedBooks = localStorage.getItem('books');

            if (storedCategories && storedTags && storedBooks) {
                setCategories(JSON.parse(storedCategories));
                setTags(JSON.parse(storedTags));
                setBooks(JSON.parse(storedBooks));
            } else {
                const response = await fetch('/books.json');
                const data = await response.json();
                setCategories(data.categories);
                setTags(data.tags);
                setBooks(data.books);

                localStorage.setItem('categories', JSON.stringify(data.categories));
                localStorage.setItem('tags', JSON.stringify(data.tags));
                localStorage.setItem('books', JSON.stringify(data.books));
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

    const handleOpenCategoriesModal = () => {
        setIsCategoriesModalOpen(true);
    };

    const handleOpenTagsModal = () => {
        setIsTagsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsCategoriesModalOpen(false);
        setIsTagsModalOpen(false);
        setBookToDelete(null);
        setBookToEdit(null);
        setCategoryToEdit(null);
        setTagToEdit(null);
        setIsAddingNewCategory(false);
        setIsAddingNewTag(false);
        setNewCategoryInput("");
        setNewTagInput("");
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

    const generateUniqueId = (): string => {
        let newId: string;
        do {
            newId = (Math.floor(10000 + Math.random() * 90000)).toString(); // Generate a random 5-digit string
        } while (categories.some(category => category.id === newId) || tags.some(tag => tag.id === newId));
        return newId;
    };

    const handleDeleteCategory = (categoryId: string) => {
        const updatedCategories = categories.filter(category => category.id !== categoryId);
        const updatedBooks = books.map(book => ({
            ...book,
            categories: book.categories.filter(id => id.toString() !== categoryId)
        }));
        setCategories(updatedCategories);
        setBooks(updatedBooks);
        localStorage.setItem('categories', JSON.stringify(updatedCategories));
        localStorage.setItem('books', JSON.stringify(updatedBooks));
    };

    const handleEditCategory = (category: Category) => {
        setCategoryToEdit(category);
        setNewCategoryName(category.name);
    };

    
    const handleSaveCategory = () => {
        if (categoryToEdit) {
            const updatedCategories = categories.map(category =>
                category.id === categoryToEdit.id ? { ...category, name: newCategoryName } : category
            );
            setCategories(updatedCategories);
            localStorage.setItem('categories', JSON.stringify(updatedCategories));
            setCategoryToEdit(null);
            setNewCategoryName("");
        }
    };

    const handleAddNewCategory = () => {
        if (newCategoryInput.trim() !== "") {
            const newId: string = generateUniqueId();
            const newCategory: Category = {
                id: newId,
                name: newCategoryInput
            };
            const updatedCategories = [...categories, newCategory];
            setCategories(updatedCategories);
            localStorage.setItem('categories', JSON.stringify(updatedCategories));
            setNewCategoryInput("");
            setIsAddingNewCategory(false);
        }
    };
    
    const handleDeleteTag = (tagId: string) => {
        const updatedTags = tags.filter(tag => tag.id !== tagId);
        const updatedBooks = books.map(book => ({
            ...book,
            tags: book.tags.filter(id => id.toString() !== tagId)
        }));
        setTags(updatedTags);
        setBooks(updatedBooks);
        localStorage.setItem('tags', JSON.stringify(updatedTags));
        localStorage.setItem('books', JSON.stringify(updatedBooks));
    };


    const handleEditTag = (tag: Tag) => {
        setTagToEdit(tag);
        setNewTagName(tag.name);
    };

    const handleSaveTag = () => {
        if (tagToEdit) {
            const updatedTags = tags.map(tag =>
                tag.id === tagToEdit.id ? { ...tag, name: newTagName } : tag
            );
            setTags(updatedTags);
            localStorage.setItem('tags', JSON.stringify(updatedTags));
            setTagToEdit(null);
            setNewTagName("");
        }
    };

    const handleAddNewTag = () => {
        if (newTagInput.trim() !== "") {
            const newId: string = generateUniqueId();
            const newTag: Tag = {
                id: newId,
                name: newTagInput
            };
            const updatedTags = [...tags, newTag];
            setTags(updatedTags);
            localStorage.setItem('tags', JSON.stringify(updatedTags));
            setNewTagInput("");
            setIsAddingNewTag(false);
        }
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
            <Button variant="contained" color="primary" onClick={handleOpenAddModal} style={{ marginTop: 20, marginRight: 10 }}>
                Add Book
            </Button>
            <Button variant="contained" color="secondary" onClick={handleOpenCategoriesModal} style={{ marginTop: 20, marginRight: 10 }}>
                Categories
            </Button>
            <Button variant="contained" color="secondary" onClick={handleOpenTagsModal} style={{ marginTop: 20 }}>
                Tags
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
            <Dialog open={isCategoriesModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogContent>
                    {categories.map((category) => (
                        <div key={category.id} style={{ display: 'flex', alignItems: 'center', margin: '4px' }}>
                            <Chip
                                label={category.name}
                                onDelete={() => handleDeleteCategory(category.id)}
                                style={{ marginRight: '8px' }}
                            />
                            <IconButton size="small" onClick={() => handleEditCategory(category)}>
                                <EditIcon />
                            </IconButton>
                        </div>
                    ))}
                    {categoryToEdit && (
                        <div style={{ marginTop: '16px' }}>
                            <TextField
                                label="Edit Category Name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" color="primary" onClick={handleSaveCategory} style={{ marginTop: '8px' }}>
                                Save
                            </Button>
                        </div>
                    )}
                    {isAddingNewCategory ? (
                        <div style={{ marginTop: '16px' }}>
                            <TextField
                                label="New Category Name"
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" color="primary" onClick={handleAddNewCategory} style={{ marginTop: '8px' }}>
                                Add Category
                            </Button>
                        </div>
                    ) : (
                        <Button variant="contained" color="primary" onClick={() => setIsAddingNewCategory(true)} style={{ marginTop: '16px' }}>
                            Add New Category
                        </Button>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={isTagsModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Manage Tags</DialogTitle>
                <DialogContent>
                    {tags.map((tag) => (
                        <div key={tag.id} style={{ display: 'flex', alignItems: 'center', margin: '4px' }}>
                            <Chip
                                label={tag.name}
                                onDelete={() => handleDeleteTag(tag.id)}
                                style={{ marginRight: '8px' }}
                            />
                            <IconButton size="small" onClick={() => handleEditTag(tag)}>
                                <EditIcon />
                            </IconButton>
                        </div>
                    ))}
                    {tagToEdit && (
                        <div style={{ marginTop: '16px' }}>
                            <TextField
                                label="Edit Tag Name"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" color="primary" onClick={handleSaveTag} style={{ marginTop: '8px' }}>
                                Save
                            </Button>
                        </div>
                    )}
                    {isAddingNewTag ? (
                        <div style={{ marginTop: '16px' }}>
                            <TextField
                                label="New Tag Name"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" color="primary" onClick={handleAddNewTag} style={{ marginTop: '8px' }}>
                                Add Tag
                            </Button>
                        </div>
                    ) : (
                        <Button variant="contained" color="primary" onClick={() => setIsAddingNewTag(true)} style={{ marginTop: '16px' }}>
                            Add New Tag
                        </Button>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default BookList;