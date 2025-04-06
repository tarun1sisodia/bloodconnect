bloodconnect/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   ├── donationController.js
│   │   │   └── authController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Donation.js
│   │   │   └── BloodType.js
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
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── favicon.ico
    ├── src/
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── Footer.js
    │   │   ├── UserProfile.js
    │   │   ├── DonationForm.js
    │   │   └── DonationList.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── Dashboard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── styles/
    │   │   ├── App.css
    │   │   └── variables.css
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── tests/
    │   │   ├── Home.test.js
    │   │   └── UserProfile.test.js
    │   ├── App.js
    │   ├── index.js
    │   └── serviceWorker.js
    ├── .env
    ├── package.json
    ├── package-lock.json
    └── README.md