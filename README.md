# FED assignment - Singapore Hawker Centre Management System

## Description
The Singapore Hawker Centre Management System is a role-based web application developed for the Front End Development (FED) module.
It simulates a real-world hawker centre ecosystem, allowing different stakeholders to interact with the system based on their responsibilities.

The system supports customers, stall vendors, NEA officers, and operators, each with dedicated interfaces and features.
All data is dynamically handled using Firebase, and dashboards visualise real-time information such as inspections and complaints.

## Features

**Customers**
- View available stalls and food items
- Place orders on multiple items
- Change cart item quantities
- Checkout orders
- Give likes to items
- Give feedback to stalls

**Stall vendors**
- View stall overview
- Manage their menus
- Create and edit menu items
- Manage stall promotions
- Manage their queues

**NEA Officers**
- Log in to a dedicated NEA officer portal
- Conduct hygiene inspections on stalls
- Assign hygiene scores and grades
- View historical inspection records

**Operators**
- Log in to an operator-only dashboard
- View hawker centre overview statistics
- Monitor hygiene grade distribution
- Track complaint trends over time
- Identify underperforming stalls based on inspections and complaints

## Technologies Used
**Core Technologies**
- HTML5
- CSS3
- JavaScript
- Flexbox

**APIs & Libraries**
- Firebase Firestore
- Firebase Realtime Database
- Firebase Authentication
- Chart.js

**Tools**
- Git & GitHub
- GitHub Pages
- Visual Studio Code
- Browser DevTools (testing & debugging)

## How to Run the Project
1. Download or clone this repository.
2. Open the project folder.
3. Run `index.html` using Live Server, or open directly in a browser.

## Deployment
This project is deployed using GitHub Pages.

GitHub Pages Link:

## API Usage Explanation
The application uses Firebase Firestore as its primary API for data storage and retrieval.

Examples of API usage:
- Fetching inspection records to generate hygiene grade charts
- Retrieving complaint data to plot complaint trends
- Storing new inspection results submitted by NEA officers
- Loading operator-specific dashboard data dynamically

Chart.js is used together with Firebase data to visualise real-time, user-generated information.

## Testing
The project was tested using:
- Manual browser testing on Chrome
- Chrome DevTools
- Responsive checks using different screen sizes
- Firebase console to verify data reads/writes

## Limitations
- This project is primarily designed for desktop screens
- Mobile responsiveness is basic and may noy be fully refined
- Authentication is role-based but simplified for assignment scope