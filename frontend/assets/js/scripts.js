bloodconnect/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   ├── donationController.js
│   │   │   └── authController.js
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   ├── donationModel.js
│   │   │   └── bloodTypeModel.js
│   │   ├── routes/
│   │   │   ├── userRoutes.js
│   │   │   ├── donationRoutes.js
│   │   │   └── authRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── config.js
│   │   ├── services/
│   │   │   ├── userService.js
│   │   │   └── donationService.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── emailService.js
│   │   ├── tests/
│   │   │   ├── user.test.js
│   │   │   └── donation.test.js
│   │   └── app.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── favicon.ico
    │
    ├── src/
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── Footer.js
    │   │   ├── UserProfile.js
    │   │   └── DonationForm.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── Donations.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── services/
    │   │   └── apiService.js
    │   ├── styles/
    │   │   └── App.css
    │   ├── tests/
    │   │   ├── Home.test.js
    │   │   └── UserProfile.test.js
    │   ├── App.js
    │   ├── index.js
    │   └── setupTests.js
    │
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    └── README.md