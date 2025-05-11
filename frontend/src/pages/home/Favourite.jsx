import BookCard from "../books/BookCard";
import { useGetFavoriteBookQuery } from "../../redux/features/books/booksApi";

function Favourite() {
  const {
    data: favourites = [],
    isLoading,
    isError,
  } = useGetFavoriteBookQuery();

  if (isLoading) return <p className="text-center">جاري التحميل...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500">حدث خطأ أثناء جلب البيانات</p>
    );

  return (
    <div className="fav-page">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {favourites.map((book, i) => (
            <div key={i}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favourite;
