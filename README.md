# SupaForm Builder 🚀

A powerful, open-source **form builder** with drag-and-drop interface, template management, and real-time preview. Built with React, TypeScript, and Firebase.

## ✨ Features

- **🎨 Drag-and-Drop Builder** - Intuitive form creation interface
- **📋 Templates** - Pre-built form templates for quick setup
- **👁️ Real-time Preview** - See changes instantly
- **📱 Responsive Design** - Works on desktop and mobile
- **💾 Cloud Storage** - Firebase integration for persistence
- **🔐 Secure** - Anonymous authentication + security best practices
- **📦 Type-Safe** - Full TypeScript support with Zod validation
- **🎯 Form.io Integration** - Powerful form builder engine
- **⚡ Fast** - Vite + React for optimal performance

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9+ or **yarn** 3+
- **Firebase** account (free tier supported)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MorganTran/builder-supaform.git
   cd builder-supaform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable these services:
     - ✅ Authentication (Anonymous)
     - ✅ Cloud Storage
     - ✅ App Check (reCAPTCHA v3)

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase credentials:
   ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_APPCHECK_RECAPTCHAV3PROVIDER=your_recaptcha_key
    VITE_ENDPOINT_IFRAME=your_endpoint_iframe
    VITE_ENDPOINT_GITHUT_SRC=your_endpoint_githut_src
    VITE_ENDPOINT_LINKEDIN=your_endpoint_linkedin
    VITE_ENDPOINT_FORMJSON=your_endpoint_formjson
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Project Structure

```
builder.supaform.com/
├── src/
│   ├── components/
│   │   ├── BuilderForm/              # Main form builder interface
│   │   │   ├── Home.tsx              # Builder container
│   │   │   ├── Header.tsx            # Top navigation
│   │   │   ├── Setting.tsx           # Form settings panel
│   │   │   ├── Preview.tsx           # Form preview
│   │   │   └── Tutorials/            # Integration guides
│   │   ├── BuilderTemplateForm/      # Template management
│   │   │   ├── Home.tsx              # Template list/gallery
│   │   │   ├── TemplateCard.tsx      # Template item
│   │   │   ├── HeroSection.tsx       # Landing section
│   │   │   └── ...
│   │   └── ...
│   ├── types/
│   │   ├── Form.ts                   # TypeScript types & schemas
│   │   ├── Consts.ts                 # Constants
│   │   └── ...
│   ├── firebase.ts                   # Firebase configuration
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── public/
│   ├── css/                          # CSS files
│   ├── icons.svg                     # Icon sprites
│   └── favicon.svg
├── .env.example                      # Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

```

## 🛠️ Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Open in browser
# http://localhost:5173
```

### Building

```bash
# Type check and build for production
npm run build
```

### Code Quality

```bash
# Lint TypeScript and JavaScript
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

## 🔧 Configuration

### Firebase Setup

1. **Storage Rules**
   ```javascript
    rules_version = '2';

    service firebase.storage {
      match /b/{bucket}/o {

        // 1/ Block reading and writing on all paths by default
        match /{allPaths=**} {
          allow read, write: if false;
        }
        
        // Rules for the "/forms" directory
        match /forms/{allFiles=**} {
          
          // 3/ Allow read JSON files into "/forms" public for everyone
          // (Enforces that the retrieved file is a JSON)
          allow read: if request.auth == null || request.auth != null; 
          
          // 2/ Allow writing JSON files into "/forms" with specific constraints
          allow write: if request.auth != null                      // Must be authenticated
                      && request.resource.size < 300 * 1024        // Size under 300KB
                      && request.resource.contentType == 'application/json'; // Must be JSON format
        }
        
        // Rules for the "/templates" directory
        match /templates/{allFiles=**} {
          
          // 3/ Allow read JSON files into "/templates" public for everyone
          // (Enforces that the retrieved file is a JSON)
          allow read: if request.auth == null || request.auth != null; 
          
          // 2/ Allow writing JSON files into "/templates" with specific constraints
          allow write: if request.auth != null                      // Must be authenticated
                      && request.resource.size < 300 * 1024        // Size under 300KB
                      && request.resource.contentType == 'application/json'; // Must be JSON format
        }
      }
    }
   ```

2. **CORS Configuration**
   See `firebase_storage_cors.json` for example configuration

3. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials
   - Never commit `.env.local` to version control

## 📚 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19 |
| **Language** | TypeScript | 6.0+ |
| **Build Tool** | Vite | 8.0+ |
| **Form Builder** | Form.io | 5.4+ |
| **Backend** | Firebase | 12.14+ |
| **Validation** | Zod | 4.4+ |
| **Linting** | ESLint | 10.0+ |

## 🎓 Usage Examples

### Creating a Form Programmatically

```typescript
import { FormSu, FormSuSchema } from './types/Form';

const newForm: FormSu = {
  display: 'form',
  meta: {
    display_name: 'Contact Form',
    description: 'Simple contact form',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    form_su: 'normal'
  },
  components: [
    {
      type: 'textfield',
      label: 'Email',
      key: 'email',
      validate: { required: true }
    }
  ]
};

// Validate with Zod
const validatedForm = FormSuSchema.parse(newForm);
```

### Uploading Forms to Firebase

```typescript
import { uploadFileJson } from './firebase';

await uploadFileJson(
  JSON.stringify(validatedForm),
  `forms/my-form-id.json`
);
```

## 🧪 Testing

To add tests:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Create test files with `.test.ts` or `.test.tsx` extension.

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
```

## 🐛 Troubleshooting

### Firebase Credentials Not Loading

- ✅ Check `.env.local` exists
- ✅ Verify variable names match `import.meta.env.VITE_*`
- ✅ Restart dev server after changing environment
- ✅ Check Firebase Console for correct credentials

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Storage Access Denied

- ✅ Check Firebase Storage rules are correct
- ✅ Verify anonymous auth is enabled
- ✅ Check CORS configuration

## 📖 Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Form.io Documentation](https://help.form.io/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Quick start:

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and commit
git commit -m "feat: add amazing feature"

# 4. Push and create Pull Request
git push origin feature/amazing-feature
```

## 🔒 Security

Please report security vulnerabilities responsibly. See [SECURITY.md](SECURITY.md) for details.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 💝 Support

- ⭐ Star the repository if you find it helpful
- 📧 Contact: morganvuongtran+supportsupaform@gmail.com

## 👨‍💻 Author

Built with ❤️ by the SupaForm team

## 🙌 Acknowledgments

- [Form.io](https://www.form.io/) - Form builder engine
- [Firebase](https://firebase.google.com/) - Backend services
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev/) - Build tool

---

**Happy form building! 🎉**

[⬆ Back to top](#supaform-builder)