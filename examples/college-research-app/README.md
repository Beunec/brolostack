# College Research App - Brolostack Example

A comprehensive research management application for college students built with Brolostack.

## Features

- **Research Project Management**: Create, track, and manage academic research projects
- **Project Status Tracking**: Monitor progress from planning to publication
- **Subject Organization**: Categorize projects by academic subjects
- **Priority Management**: Set and track project priorities
- **Tag System**: Organize projects with custom tags
- **Due Date Tracking**: Never miss important deadlines
- **Statistics Dashboard**: View research progress at a glance

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the example directory:
   ```bash
   cd examples/college-research-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3003`

## Usage

### Adding Research Projects

1. Fill out the research project form with:
   - Project title
   - Description
   - Subject area
   - Priority level
   - Due date (optional)
   - Tags (comma-separated)

2. Click "Add Research Project" to save

### Managing Projects

- **Update Status**: Use the dropdown to change project status
- **Delete Projects**: Click the delete button to remove projects
- **View Statistics**: Check the dashboard for project counts and progress

### Project Statuses

- **Planning**: Initial research and planning phase
- **In Progress**: Active research and development
- **Completed**: Research finished, ready for review
- **Published**: Research published or submitted

### Priority Levels

- **High**: Urgent projects with tight deadlines
- **Medium**: Standard priority projects
- **Low**: Background or long-term projects

## Data Persistence

All data is stored locally in your browser using Brolostack's built-in storage system. Your research projects will persist between sessions and remain private on your device.

## Built With

- **Brolostack**: Zero-cost full-stack framework
- **React**: User interface library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

## Example Use Cases

- **Undergraduate Research**: Track capstone projects and thesis work
- **Graduate Studies**: Manage dissertation and research papers
- **Academic Collaboration**: Organize group research projects
- **Course Projects**: Track assignments and research components
- **Publication Pipeline**: Monitor papers from conception to publication

## Customization

The app can be easily customized by modifying:

- `src/App.tsx`: Main application logic and components
- `src/App.css`: Styling and visual design
- `src/main.tsx`: Brolostack configuration and store setup

## License

MIT License - see the main Brolostack repository for details.
