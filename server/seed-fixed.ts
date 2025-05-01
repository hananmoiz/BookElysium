import { db, pool } from './db';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { 
  users, books, categories, InsertUser, InsertBook, InsertCategory
} from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // First check if we have any categories
    const existingCategories = await db.select().from(categories);
    // First check if we have any books
    const existingBooks = await db.select().from(books);

    // Create categories if needed
    if (existingCategories.length === 0) {
      // Create categories
      const categoryData: InsertCategory[] = [
        { name: "Science Fiction", icon: "rocket-line", color: "#4A6D7C", bookCount: 1234 },
        { name: "Romance", icon: "heart-line", color: "#8C5E58", bookCount: 2567 },
        { name: "Mystery & Thriller", icon: "ghost-line", color: "#F9A826", bookCount: 1892 },
        { name: "Non-Fiction", icon: "book-line", color: "#4CAF50", bookCount: 3421 },
        { name: "Fantasy", icon: "sword-line", color: "#9C27B0", bookCount: 2145 },
        { name: "Biography", icon: "user-line", color: "#3F51B5", bookCount: 1567 },
        { name: "Self-Help", icon: "mental-health-line", color: "#FF5722", bookCount: 1876 },
        { name: "History", icon: "ancient-gate-line", color: "#795548", bookCount: 1432 }
      ];
      
      for (const category of categoryData) {
        await db.insert(categories).values(category);
      }
      console.log('Created categories');
    } else {
      console.log('Categories already exist, skipping creation');
    }

    // Create sample books if needed
    if (existingBooks.length === 0) {
      // Create sample books
      const bookData: InsertBook[] = [
        {
          title: "Dune",
          author: "Frank Herbert",
          description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
          genre: "Science Fiction",
          isFree: false,
          rating: 5,
          ratingCount: 1203,
          publishDate: "1965-08-01",
          olid: "OL1532243W",
          url: "https://www.goodreads.com/book/show/44767458-dune"
        },
        {
          title: "The Hitchhiker's Guide to the Galaxy",
          author: "Douglas Adams",
          description: "Seconds before Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked off the planet by his friend Ford Prefect, a researcher for the revised edition of The Hitchhiker's Guide to the Galaxy.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1559986152i/386162.jpg",
          genre: "Science Fiction",
          isFree: true,
          rating: 4,
          ratingCount: 987,
          publishDate: "1979-10-12",
          olid: "OL7440625M",
          url: "https://www.goodreads.com/book/show/386162.The_Hitchhiker_s_Guide_to_the_Galaxy"
        },
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
          genre: "Fantasy",
          isFree: true,
          rating: 5,
          ratingCount: 1567,
          publishDate: "1937-09-21",
          olid: "OL262458W",
          url: "https://www.goodreads.com/book/show/5907.The_Hobbit"
        },
        {
          title: "Harry Potter and the Sorcerer's Stone",
          author: "J.K. Rowling",
          description: "Harry Potter has no idea how famous he is. That's because he's being raised by his miserable aunt and uncle who are terrified Harry will learn that he's really a wizard, just as his parents were.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg",
          genre: "Fantasy",
          isFree: false,
          rating: 5,
          ratingCount: 2345,
          publishDate: "1997-06-26",
          olid: "OL82586W",
          url: "https://www.goodreads.com/book/show/3.Harry_Potter_and_the_Sorcerer_s_Stone"
        },
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          description: "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
          genre: "Romance",
          isFree: true,
          rating: 5,
          ratingCount: 1876,
          publishDate: "1813-01-28",
          olid: "OL1394489M",
          url: "https://www.goodreads.com/book/show/1885.Pride_and_Prejudice"
        },
        {
          title: "The Notebook",
          author: "Nicholas Sparks",
          description: "Set amid the austere beauty of the North Carolina coast, The Notebook begins with the story of Noah Calhoun, a rural Southerner recently returned from the Second World War.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1385738917i/15931.jpg",
          genre: "Romance",
          isFree: false,
          rating: 4,
          ratingCount: 1432,
          publishDate: "1996-10-01",
          olid: "OL24626951M",
          url: "https://www.goodreads.com/book/show/15931.The_Notebook"
        },
        {
          title: "Gone Girl",
          author: "Gillian Flynn",
          description: "On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne's fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick's clever and beautiful wife disappears.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554086139i/19288043.jpg",
          genre: "Mystery & Thriller",
          isFree: false,
          rating: 4,
          ratingCount: 1987,
          publishDate: "2012-06-05",
          olid: "OL16665249W",
          url: "https://www.goodreads.com/book/show/19288043-gone-girl"
        },
        {
          title: "The Da Vinci Code",
          author: "Dan Brown",
          description: "While in Paris, Harvard symbologist Robert Langdon is awakened by a phone call in the dead of the night. The elderly curator of the Louvre has been murdered inside the museum.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621267i/968.jpg",
          genre: "Mystery & Thriller",
          isFree: true,
          rating: 4,
          ratingCount: 1756,
          publishDate: "2003-03-18",
          olid: "OL37926911M",
          url: "https://www.goodreads.com/book/show/968.The_Da_Vinci_Code"
        },
        {
          title: "Sapiens: A Brief History of Humankind",
          author: "Yuval Noah Harari",
          description: "100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance?",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420585954i/23692271.jpg",
          genre: "Non-Fiction",
          isFree: false,
          rating: 4,
          ratingCount: 2134,
          publishDate: "2011-01-01",
          olid: "OL28180236M",
          url: "https://www.goodreads.com/book/show/23692271-sapiens"
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535115320i/40121378.jpg",
          genre: "Self-Help",
          isFree: false,
          rating: 5,
          ratingCount: 2345,
          publishDate: "2018-10-16",
          olid: "OL27347937M",
          url: "https://www.goodreads.com/book/show/40121378-atomic-habits"
        }
      ];
      
      for (const book of bookData) {
        await db.insert(books).values(book);
      }
      console.log('Created sample books');
    } else {
      console.log('Books already exist, skipping creation');
    }

    // Create test user if needed
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      // Create test user
      const hashedPassword = await hashPassword('password123');
      const testUser: InsertUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        fullName: 'Test User'
      };
      
      await db.insert(users).values(testUser);
      console.log('Created test user');
    } else {
      console.log('Users already exist, skipping creation');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();