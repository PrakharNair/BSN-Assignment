"use client";

import React, { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Checkbox,
    ListItemText,
    OutlinedInput,
} from '@mui/material';
import { Book, Category, Tag } from '../interfaces/Book';

interface AddBookProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBook: (book: Book) => void;
    categories: Category[];
    tags: Tag[];
    nextId: number;
}

const AddBook: React.FC<AddBookProps> = ({ isOpen, onClose, onAddBook, categories, tags, nextId }) => {
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        genre: '',
        rating: 0,
        categories: [] as number[],
        tags: [] as number[],
    });
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const { title, author, genre, rating } = newBook;
        setIsFormValid(title.trim() !== '' && author.trim() !== '' && genre.trim() !== '' && rating >= 0 && rating <= 5);
    }, [newBook]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let updatedValue: string | number = value;

        if (name === 'rating') {
            const ratingValue = parseFloat(value);
            if (ratingValue < 0) {
                updatedValue = 0;
            } else if (ratingValue > 5) {
                updatedValue = 5;
            } else {
                updatedValue = ratingValue;
            }
        }
        setNewBook({
            ...newBook,
            [name]: updatedValue,
        });
    };

    const handleMultiSelectChange = (name: string, values: number[]) => {
        setNewBook({
            ...newBook,
            [name]: values,
        });
    };

    const handleSubmit = () => {
        if (isFormValid) {
            onAddBook({ ...newBook, id: nextId });
            setNewBook({
                title: '',
                author: '',
                genre: '',
                rating: 0,
                categories: [] as number[],
                tags: [] as number[],
            });
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Title"
                    name="title"
                    value={newBook.title}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    margin="dense"
                    label="Author"
                    name="author"
                    value={newBook.author}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    margin="dense"
                    label="Genre"
                    name="genre"
                    value={newBook.genre}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    margin="dense"
                    label="Personal Rating"
                    name="rating"
                    type="number"
                    value={newBook.rating}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ min: 0, max: 5 }}
                    required
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Categories</InputLabel>
                    <Select
                        multiple
                        value={newBook.categories}
                        onChange={(e) => handleMultiSelectChange('categories', e.target.value as number[])}
                        input={<OutlinedInput label="Categories" />}
                        renderValue={(selected) => (selected as number[]).map(id => categories.find(category => category.id === id.toString())?.name).join(', ')}
                    >
                        {categories.map(category => (
                            <MenuItem key={category.id} value={parseInt(category.id)}>
                                <Checkbox checked={newBook.categories.indexOf(parseInt(category.id)) > -1} />
                                <ListItemText primary={category.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <InputLabel>Tags</InputLabel>
                    <Select
                        multiple
                        value={newBook.tags}
                        onChange={(e) => handleMultiSelectChange('tags', e.target.value as number[])}
                        input={<OutlinedInput label="Tags" />}
                        renderValue={(selected) => (selected as number[]).map(id => tags.find(tag => tag.id === id.toString())?.name).join(', ')}
                    >
                        {tags.map(tag => (
                            <MenuItem key={tag.id} value={parseInt(tag.id)}>
                                <Checkbox checked={newBook.tags.indexOf(parseInt(tag.id)) > -1} />
                                <ListItemText primary={tag.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary" disabled={!isFormValid}>
                    Add Book
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddBook;