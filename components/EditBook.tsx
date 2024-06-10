import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, ListItemText, OutlinedInput, Button } from '@mui/material';
import { Book, Category, Tag } from '../interfaces/Book';


interface EditBookProps {
    isOpen: boolean;
    onClose: () => void;
    onEditBook: (book: Book) => void;
    categories: Category[];
    tags: Tag[];
    initialBook: Book;
}

const EditBook: React.FC<EditBookProps> = ({ isOpen, onClose, onEditBook, categories, tags, initialBook }) => {
    const [book, setBook] = useState<Book>(initialBook);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        setBook(initialBook);
    }, [initialBook]);

    useEffect(() => {
        const { title, author, genre, rating } = book;
        setIsFormValid(title.trim() !== '' && author.trim() !== '' && genre.trim() !== '' && rating >= 0 && rating <= 5);
    }, [book]);

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

        setBook({
            ...book,
            [name]: updatedValue,
        });
    };

    const handleMultiSelectChange = (name: string, values: number[]) => {
        setBook({
            ...book,
            [name]: values,
        });
    };

    const handleSubmit = () => {
        if (isFormValid) {
            onEditBook(book);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Title"
                    name="title"
                    value={book.title}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    margin="dense"
                    label="Author"
                    name="author"
                    value={book.author}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    margin="dense"
                    label="Genre"
                    name="genre"
                    value={book.genre}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    margin="dense"
                    label="Personal Rating"
                    name="rating"
                    type="number"
                    value={book.rating}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ min: 0, max: 5 }}
                    required
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Categories</InputLabel>
                    <Select
                        multiple
                        value={book.categories}
                        onChange={(e) => handleMultiSelectChange('categories', e.target.value as number[])}
                        input={<OutlinedInput label="Categories" />}
                        renderValue={(selected) => (selected as number[]).map(id => categories.find(category => category.id === id.toString())?.name).join(', ')}
                    >
                        {categories.map(category => (
                            <MenuItem key={category.id} value={parseInt(category.id)}>
                                <Checkbox checked={book.categories.includes(parseInt(category.id))} />
                                <ListItemText primary={category.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <InputLabel>Tags</InputLabel>
                    <Select
                        multiple
                        value={book.tags}
                        onChange={(e) => handleMultiSelectChange('tags', e.target.value as number[])}
                        input={<OutlinedInput label="Tags" />}
                        renderValue={(selected) => (selected as number[]).map(id => tags.find(tag => tag.id === id.toString())?.name).join(', ')}
                    >
                        {tags.map(tag => (
                            <MenuItem key={tag.id} value={parseInt(tag.id)}>
                                <Checkbox checked={book.tags.includes(parseInt(tag.id))} />
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
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditBook;