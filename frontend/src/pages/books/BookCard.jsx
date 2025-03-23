import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { getImgUrl } from '../../utils/getImgUrl'

import { Link } from'react-router-dom'

import { useDispatch } from'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { IoEyeOutline } from 'react-icons/io5'
import { FaStar } from "react-icons/fa6";

const BookCard = ({book}) => {
    const dispatch =  useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product))
    }
    return (
        <div className=" rounded-lg transition-shadow duration-300 border border-slate-500 px-4">
            <div
                className="space-y-6"
            >
                <div className="sm:h-[400px] sm:flex-shrink-0 border rounded-md">
                    <Link to={`/books/${book._id}`}>
                        <img
                            src={book?.coverImage}
                            alt=""
                            className=" max-w-[300px] mx-auto aspect-video bg-cover p-2 rounded-md cursor-pointer hover:scale-105 transition-all duration-200"
                        />
                    </Link>
                </div>

                <div className='text-center'>
                    <Link to={`/books/${book._id}`}>
                        <h3 className="text-xl font-semibold hover:text-blue-600 mb-3">
                       {book?.title}
                        </h3>
                    </Link>
                    {/*<p className="text-gray-600 ">{book?.description.length > 80 ? `${book.description.slice(0, 80)}...` : book?.description}</p>*/}
                    <p className="font-medium my-4">
                        ${book?.newPrice} <span className="line-through font-normal ml-2">$ {book?.oldPrice}</span>
                    </p>
                    <div className="flex items-center justify-center gap-1 mb-5 text-yellow-500">
                        {
                              Array.from({ length: 5 }).map((_, index) => (
                                <FaStar className='text-2xl' />
                              ))
                        }
                    </div>
                    <div className="flex items-center justify-center gap-4 py-5 border-t border-slate-500 px-8">
                    <button 
                    onClick={() => handleAddToCart(book)}
                    className=" text-2xl ">
                        <FiShoppingCart className="" />
                        {/*<span>Add to Cart</span>*/}
                    </button>
                    <Link to={`/books/${book._id}`}>
                    <IoEyeOutline className=" text-2xl " />
                    </Link>

                    </div>
                  
                </div>
            </div>
        </div>
    )
}

export default BookCard