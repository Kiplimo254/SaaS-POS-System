# SaaS POS System

A comprehensive, multi-tenant Point of Sale (POS) system designed for small to medium-sized businesses. This project features a robust Django backend and a modern, responsive Vite/React frontend.

##  Features

- **Multi-tenant Architecture**: Support for multiple shops within a single installation.
- **User Roles & Permissions**: Specialized roles for Super Admins, Admins, Managers, and Cashiers.
- **Inventory Management**:
    - Product categorization, branding, and unit management.
    - Automated barcode generation and image saving.
    - Low stock alerts and stock adjustment tracking.
    - Stock transfers between shops.
- **Sales & Customer Management**:
    - Intuitive POS interface for quick transactions.
    - Customer loyalty points and balance tracking.
    - Multiple payment methods (Cash, M-Pesa, Bank).
    - Sales returns and refund management.
- **Supplier & Purchase Management**:
    - Track suppliers and purchase history.
    - Manage inventory restocks efficiently.
- **Financial Tracking**:
    - Expense categorization and tracking.
    - Detailed sales reporting (tax, discounts, etc.).
- **Printable Receipts**: Professional receipt generation using `react-to-print` and `jspdf`.

##  Tech Stack

### Backend
- **Framework**: Django
- **Database**: PostgreSQL/MySQL
- **Features**: REST API, Barcode generation (`python-barcode`), Image handling.

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Validation**: Zod & React Hook Form
- **Routing**: React Router DOM

##  Installation

### Prerequisites
- Python 3.10+
- Node.js & npm (or Bun)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install  # or bun install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License.

## 👤 Author
## VICTOR CREATIONS
GitHub: [Kiplimo254](https://github.com/Kiplimo254)
## CONTACT FOR THE ONBOARDING PROCESS.
## LIVE DEMO LINKS AVAILABLE
