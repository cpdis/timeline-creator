# Project Timeline App

## Description

The Project Timeline App is a React-based web application designed to help project managers and teams visualize and manage project timelines. It allows users to input project events, track estimated and actual durations, and view the project progress through an interactive timeline chart.

## Features

- Input and display project information (title, customer, start date/time, locations, rig, vessel)
- Add, edit, and delete project events
- Track estimated and actual durations for each event
- Automatically calculate start and end times based on durations
- Display a cumulative timeline chart for estimated and actual durations
- Show project summary statistics (estimated days, actual days, estimated completion date)
- Responsive design for various screen sizes
- Data persistence using localStorage

## How to Run

1. Clone the repository:
   ```
   git clone https://github.com/your-username/project-timeline-app.git
   cd project-timeline-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the app.

## Building for Production

To create a production build, run:
```
npm run build
```

This will create a `build` folder with optimized production-ready files.

## Technologies Used

- React
- Chart.js
- Tailwind CSS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.