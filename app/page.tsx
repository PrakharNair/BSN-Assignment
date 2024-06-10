"use client";

import React from 'react';
import BookList from '../components/BookList';
import { CssBaseline } from '@mui/material';

const Home: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <BookList />
        </>
    );
};

export default Home;
