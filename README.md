# Brain Barter

**A Skill Exchange & Peer Learning Platform**

Brain Barter is a web-based peer learning platform designed to connect users through **mutual skill exchange**.
Instead of focusing on social relationships or content consumption, the platform emphasizes **learning reciprocity**, **skill complementarity**, and **collaborative growth**.

This project was developed as a **full-stack web application** with real-world product structure and deployment considerations.

---

## Live Demo & Project Resources

* **Live Website**
  [https://brain-barter-web.onrender.com](https://brain-barter-web.onrender.com)

* **Project Presentation (Slides)**
  [https://www.canva.com/design/DAG8KnboN-8/o7b_IT24woq4nuf4f5Jyrw/edit](https://www.canva.com/design/DAG8KnboN-8/o7b_IT24woq4nuf4f5Jyrw/edit)

* **Source Code (GitHub)**
  [https://github.com/MickXie/2025_WebProgram_Final_Project](https://github.com/MickXie/2025_WebProgram_Final_Project)

---

## Project Motivation

Most existing platforms fall into one of two categories:

1. **Learning platforms** that are content-driven and one-directional
2. **Matching or social platforms** that optimize for engagement rather than learning value

Brain Barter was created to explore a different approach:

* Learning should be **mutual**, not transactional
* Matching should be based on **skills and goals**, not superficial attributes
* A system should balance **efficiency (best matches)** and **exploration (new domains)**

The goal of this project is to demonstrate how algorithmic matching, thoughtful UX design, and a clean system architecture can support meaningful peer learning.

---

## Core Features

### 1. User Authentication & Session Management

* Student ID–based registration and login
* Token-based authentication
* Login session validity limited to **4 hours**
* Automatic redirection for already-authenticated users
* Shared authentication state via `localStorage`

---

### 2. Skill & Learning Goal Modeling

Each user can define:

* **Skills they can teach**
* **Skills they want to learn**
* Proficiency levels:

  * Level 3: Advanced
  * Level 2: Intermediate
  * Level 1: Beginner

This structured representation allows the system to evaluate **learning compatibility** quantitatively.

---

### 3. Intelligent Matching System

The matching system is designed around a **hybrid recommendation strategy**:

* Skill–interest overlap scoring
* Proficiency-weighted matching
* Mutual learning bonus (both users benefit)
* Exploration candidate to encourage cross-domain learning

Each matching session returns **three curated candidates**:

1. Highest compatibility match
2. Strong mutual-learning partner
3. Exploration-oriented recommendation

This approach avoids repetitive or overly narrow recommendations.

---

### 4. Learning Invitations & Friend System

* Users can send learning invitations after matching
* Invitation states:

  * Pending
  * Accepted
  * Rejected
* Accepted invitations create a persistent learning connection

This design ensures that communication only occurs **after mutual consent**.

---

### 5. Chat System with File Support

* One-to-one chat between connected users
* Supports:

  * Text messages
  * Image uploads
  * Audio and document files
* Uploaded files are stored and served via backend static routes

---

### 6. User Interface & Interaction Design

* Card-based matching interface
* Animated overlays for successful matches
* Visual feedback for proficiency levels
* Audio feedback on match actions
* Responsive layout optimized for desktop usage

> Screenshots can be added here:
>
> ```
> docs/images/home.png
> docs/images/match.png
> docs/images/chat.png
> ```

---

## How to Use

### 1. Register & Login

1. Open the website
2. Register using a student ID and password
3. Login to start using the platform

### 2. Complete Your Profile

* Add skills you can teach
* Add skills you want to learn
* Set proficiency levels

### 3. Start Matching

* Navigate to the Match page
* Review recommended learning partners
* Send learning invitations

### 4. Chat & Learn

* Accept invitations
* Start chatting
* Exchange knowledge and learning resources

---

## Technology Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router
* Fetch API
* Custom UI components

### Backend

* Node.js
* Express
* SQLite3
* RESTful API architecture
* Multer (file uploads)

### Deployment

* Frontend: Render
* Backend API: Render

---

## System Architecture

```
Client (React)
   ↓
REST API (Express)
   ↓
SQLite Database
   ↓
Static File Storage (uploads/)
```

* Frontend handles UI, state, and user interaction
* Backend manages authentication, matching logic, data persistence
* SQLite used for simplicity and portability

---

## Project Structure

```
2025_WebProgram_Final_Project/
│
├── my-app/                    # Frontend
│   ├── src/
│   │   ├── pages/             # Home, Login, Match, Profile
│   │   ├── components/        # UI components & overlays
│   │   ├── api/               # API configuration
│   │   └── styles/
│
├── backend/                   # Backend
│   ├── server.js              # Express server
│   ├── uploads/               # Uploaded files
│   └── skill_exchange.db      # SQLite database
│
└── README.md
```

---

## Team Collaboration

This project was developed collaboratively with **balanced workload distribution**.

Both contributors participated in:

* Frontend development
* Backend API implementation
* Debugging and feature refinement
* Deployment and integration

Responsibilities were shared flexibly, with continuous cross-support rather than rigid role separation.

---

## Future Enhancements

* Cloud storage integration (Google Drive / Dropbox)
* Bi-directional rating and trust system
* Learning schedules and calendar integration
* Group learning and multi-user matching
* Learning progress tracking and analytics

---

## License

This project is intended for **educational and demonstration purposes**.
All rights reserved by the project contributors.


