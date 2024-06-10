"use client";

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Button, Dialog, DialogActions, DialogContent, DialogTitle, Chip, IconButton, TextField, AppBar, Toolbar, Typography } from '@mui/material';
import AddBook from './AddBook';
import EditBook from './EditBook';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Book, Category, Tag } from '../interfaces/Book';
import Actions from './Actions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    // Initial data load

    /*Added API loaded on initial. NOTE: IT'S SLOW, the api i think is not supported super well so you have to wait a bit, but it will show up! Can optimize further. We still use data json for categories/tags though. */
    useEffect(() => {
        const fetchData = async () => {
            try {
                //Grab whatever is in local storage currently, opens the gate for data persistance
                const storedCategories = localStorage.getItem('categories');
                const storedTags = localStorage.getItem('tags');
                const storedBooks = localStorage.getItem('books');

                // If both the categories and tags are in storage, we can just grab those already
                if (storedCategories && storedTags) {
                    setCategories(JSON.parse(storedCategories));
                    setTags(JSON.parse(storedTags));
                } else {
                    // If not though, we know that we need to grab them from the json, which is what we do here
                    const response = await fetch('/books.json');
                    const data = await response.json();
                    setCategories(data.categories);
                    setTags(data.tags);

                    localStorage.setItem('categories', JSON.stringify(data.categories));
                    localStorage.setItem('tags', JSON.stringify(data.tags));
                }

                // Next check is independent, because there's a case where we can have no books, but still have categories load in (think of it as a failsafe if the API fails, but the app is still obviously usable)
                if (storedBooks) {
                    setBooks(JSON.parse(storedBooks));
                } else {
                    const fetchBook = async () => {
                        const response = await fetch('https://fakerapi.it/api/v1/books?_quantity=1');
                        const data = await response.json();
                        return data.data[0];
                    };

                    // We're loading in 3, but tha can obviously be changed to whatever we want
                    const booksFromApi = await Promise.all([fetchBook(), fetchBook(), fetchBook()]);

                    // The API only gives us id/title/author/genre, so we auto populate rating, and leave category/tags empty as theyre're optional. 
                    const initialBooks = booksFromApi.map((book, index) => ({
                        id: index + 1,
                        title: book.title,
                        author: book.author,
                        genre: book.genre,
                        rating: 0,
                        categories: [] as number[],
                        tags: [] as number[],
                    }));

                    setBooks(initialBooks);
                    localStorage.setItem('books', JSON.stringify(initialBooks));
                }
            } catch (error) {
                toast.error('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    // category and name helper functions
    const getCategoryNames = (ids: number[]) => {
        return ids.map(id => categories.find(category => category.id === id.toString())?.name).join(', ');
    };

    const getTagNames = (ids: number[]) => {
        return ids.map(id => tags.find(tag => tag.id === id.toString())?.name).join(', ');
    };

    // creating the rows for datagrid
    const rows = books.map(book => ({
        ...book,
        categories: getCategoryNames(book.categories),
        tags: getTagNames(book.tags)
    }));


    // below functions handle opening and closing modals
    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (bookId: number) => {
        const book = books.find(book => book.id === bookId);
        if (book) {
            setBookToEdit(book);
            setIsEditModalOpen(true);
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

    /* 
   STRUCTURE: 
       - It's pretty standard and basic but we are making sure the buttons are clicked before initiate any delete/edit. This allows for slower browsers to not break the site.
       - Overall pretty simple, and utilizes the helper component. 
   */
    //delete book
    const handleDeleteBook = () => {
        if (bookToDelete) {
            const updatedBooks = books.filter(book => book.id !== bookToDelete.id);
            setBooks(updatedBooks);
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            toast.success('Book deleted successfully');
            handleCloseModal();
        }
    };

    // add book
    const handleAddBook = (newBook: Book) => {
        try {
            const updatedBooks = [...books, newBook];
            setBooks(updatedBooks);
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            toast.success('Book added successfully');
        } catch (error) {
            toast.error('Failed to add book');
        }
    };

    // edit book
    const handleEditBook = (updatedBook: Book) => {
        try {
            const updatedBooks = books.map(book => (book.id === updatedBook.id ? updatedBook : book));
            setBooks(updatedBooks);
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            toast.success('Book edited successfully');
            handleCloseModal();
        } catch (error) {
            toast.error('Failed to edit book');
        }
    };

    // So I went with this approach because when I was testing, I only randomly generated ids to 1000, but I somehow got a dupliate on my first one!
    // Going with do while obviously requires it to run once, then it does the check, and will never really get stuck. 
    const generateUniqueId = (): string => {
        let newId: string;
        do {
            newId = (Math.floor(10000 + Math.random() * 90000)).toString();
        } while (categories.some(category => category.id === newId) || tags.some(tag => tag.id === newId));
        return newId;
    };


    /* 
    STRUCTURE: 
        - Structure for tag and category are basically identical below so I will explain the design ideas here:
            - .some turned out to be the best way to iterate here, I use it below pretty much every time below, and can discuss further in the follow-up call, but it returns the boolean if the arrow function is filled, it basically fits the use case perfectly
            - We will always set the updated category/tag into the state, then update the local storage for both category state/tag AND the book. 
            - Books is no longer necessary, I did this before because on the initial run through, I thought that if we deleted a tag/category in use, we remove it from the table entirely. This was phased out, but this is changing nothing, and provides more options to integrate further functionality.
            - Can be phased out no issues.
    */
    // delete category category
    const handleDeleteCategory = (categoryId: string) => {
        const isInUse = books.some(book => book.categories.includes(parseInt(categoryId)));
        if (isInUse) {
            toast.error('Cannot delete category as it is in use');
            return;
        }
        try {
            const updatedCategories = categories.filter(category => category.id !== categoryId);
            const updatedBooks = books.map(book => ({
                ...book,
                categories: book.categories.filter(id => id.toString() !== categoryId)
            }));
            setCategories(updatedCategories);
            setBooks(updatedBooks);
            localStorage.setItem('categories', JSON.stringify(updatedCategories));
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            toast.success('Category deleted successfully');
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };


    //edit category
    const handleEditCategory = (category: Category) => {
        setCategoryToEdit(category);
        setNewCategoryName(category.name);
    };


    // save category
    const handleSaveCategory = () => {
        if (categoryToEdit) {
            const isDuplicate = categories.some(category => category.name === newCategoryName && category.id !== categoryToEdit.id);
            if (isDuplicate) {
                toast.error('Category name already exists');
                return;
            }
            try {
                const updatedCategories = categories.map(category =>
                    category.id === categoryToEdit.id ? { ...category, name: newCategoryName } : category
                );
                setCategories(updatedCategories);
                localStorage.setItem('categories', JSON.stringify(updatedCategories));
                setCategoryToEdit(null);
                setNewCategoryName("");
                toast.success('Category edited successfully');
            } catch (error) {
                toast.error('Failed to edit category');
            }
        }
    };


    //add category
    const handleAddNewCategory = () => {
        if (newCategoryInput.trim() !== "") {
            const isDuplicate = categories.some(category => category.name === newCategoryInput);
            if (isDuplicate) {
                toast.error('Category name already exists');
                return;
            }
            try {
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
                toast.success('Category added successfully');
            } catch (error) {
                toast.error('Failed to add category');
            }
        }
    };

    //delete tag
    const handleDeleteTag = (tagId: string) => {
        const isInUse = books.some(book => book.tags.includes(parseInt(tagId)));
        if (isInUse) {
            toast.error('Cannot delete tag as it is in use');
            return;
        }
        try {
            const updatedTags = tags.filter(tag => tag.id !== tagId);
            const updatedBooks = books.map(book => ({
                ...book,
                tags: book.tags.filter(id => id.toString() !== tagId)
            }));
            setTags(updatedTags);
            setBooks(updatedBooks);
            localStorage.setItem('tags', JSON.stringify(updatedTags));
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            toast.success('Tag deleted successfully');
        } catch (error) {
            toast.error('Failed to delete tag');
        }
    };


    //edit tag
    const handleEditTag = (tag: Tag) => {
        setTagToEdit(tag);
        setNewTagName(tag.name);
    };


    //save tag
    const handleSaveTag = () => {
        if (tagToEdit) {
            // need to check if there's a duplicate
            const isDuplicate = tags.some(tag => tag.name === newTagName && tag.id !== tagToEdit.id);
            if (isDuplicate) {
                toast.error('Tag name already exists');
                return;
            }
            try {
                const updatedTags = tags.map(tag =>
                    tag.id === tagToEdit.id ? { ...tag, name: newTagName } : tag
                );
                setTags(updatedTags);
                localStorage.setItem('tags', JSON.stringify(updatedTags));
                setTagToEdit(null);
                setNewTagName("");
                toast.success('Tag edited successfully');
            } catch (error) {
                toast.error('Failed to edit tag');
            }
        }
    };

    //add tag
    const handleAddNewTag = () => {
        if (newTagInput.trim() !== "") {
            // need to check if there's a duplicate
            const isDuplicate = tags.some(tag => tag.name === newTagInput);
            if (isDuplicate) {
                toast.error('Tag name already exists');
                return;
            }
            try {
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
                toast.success('Tag added successfully');
            } catch (error) {
                toast.error('Failed to add tag');
            }
        }
    };

    // Defining columns for datagrid. Note I used renderCell, so I can render in the action component, which is just best practice, and keeps the code much cleaner.
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

    /* 
        STRUCTURE:
        - For rendering I heavily leaned on DataGrid to help with table design and filtering. It's all just built in, after all.
        - I used modals instead of popups to feel less invasive, and in adherance to good design philosophy, I limited to one modal open at a time. 
        - Category/Tags settings are their own standalone buttons with brighter buttons, to social engineer users to click on them to see what they do, and further understand complexity of app.
        - Design structure very minimal, but just making sure it looks nice at the very least. 
    */

    return (
        <Container>
            <ToastContainer />
            <AppBar position="static" style={{ marginBottom: '20px' }}>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        BSN - Prakhar Nair
                    </Typography>
                </Toolbar>
            </AppBar>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <Button variant="contained" color="primary" onClick={handleOpenAddModal} style={{ marginRight: 10 }}>
                    Add Book
                </Button>
                <div>
                    <Button variant="contained" color="secondary" onClick={handleOpenCategoriesModal} style={{ marginRight: 10 }}>
                        Categories
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleOpenTagsModal}>
                        Tags
                    </Button>
                </div>
            </div>
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