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

/*
    STRUCTURE:
        - This code is almost identical to AddBook, with minor differences. I figured it would be cleaner to separate them, even if they are close. 
        While not 100% optimal, it looks much more professional, and the run time difference is basically negligible, since both don't mount at the same time, or immediately on load of the main page.
*/


const EditBook: React.FC<EditBookProps> = ({ isOpen, onClose, onEditBook, categories, tags, initialBook }) => {
    const [book, setBook] = useState<Book>(initialBook);
    const [isFormValid, setIsFormValid] = useState(false);
    
    //set initial state, using whichever prop was passed in BookList. this is necessary to be edited further
    useEffect(() => {
        setBook(initialBook);
    }, [initialBook]);

    useEffect(() => {
        const { title, author, genre, rating } = book;
        // rules are: title/author/genre can't be empty, rating has to be 0-5. If over 5, ratings will auto change to 5. 
        setIsFormValid(title.trim() !== '' && author.trim() !== '' && genre.trim() !== '' && rating >= 0 && rating <= 5);
    }, [book]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let updatedValue: string | number = value;

        // logic to handle auto changing ratings to 5 if they go above 5, or 0 if they go below 0
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

    // setup for tags/categories

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

    
    /*
        STRUCTURE:
        - This is all pretty basic, the only thing to explain is: is the render value concept..
        - We map through the entire categories/tags that we have, and just keep selecting what we need to, and utilizing this method, allows us to use Checkboxes, which is more intuitive.
        - The render value itself will show the full list and actively update what is selected already. 
    */

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