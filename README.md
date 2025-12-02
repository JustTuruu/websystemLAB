# Places App - Газар хуваалцах платформ

Энэ төсөл нь хэрэглэгчдэд газрын мэдээлэл (зураг, байршил) хуваалцах боломж олгодог веб аппликэйшн юм.

## Технологи

### Backend
- **Node.js** + **Express.js**
- Өгөгдлийг массив хувьсагчид хадгалдаг (in-memory storage)
- RESTful API

### Frontend
- **React**
- **React Router** - Замчлал
- **Context API** - Төлөв удирдлага

## Суулгах заавар

### 1. Backend Server суулгах

```bash
# Server фолдер руу шилжих
cd server

# Dependencies суулгах
npm install

# Server ажиллуулах
npm start

# Эсвэл development mode (автомат restart)
npm run dev
```

Backend server `http://localhost:5000` дээр ажиллана.

### 2. Frontend суулгах

```bash
# Root директор дээр (эсвэл places фолдер дотор)
npm install

# Frontend ажиллуулах
npm start
```

Frontend `http://localhost:3000` дээр нээгдэнэ.

## API Endpoints

### Хэрэглэгчийн API

| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/users` | Бүх хэрэглэгчдийг авах |
| GET | `/api/users/:id` | ID-аар хэрэглэгч авах |
| POST | `/api/users/register` | Шинэ хэрэглэгч бүртгэх |
| POST | `/api/users/login` | Хэрэглэгч нэвтрэх |
| PUT | `/api/users/:id` | Хэрэглэгчийн мэдээлэл шинэчлэх |
| POST | `/api/users/:id/friends` | Найз нэмэх |
| DELETE | `/api/users/:id/friends/:friendId` | Найз хасах |

### Газрын API

| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/places` | Бүх газруудыг авах (READ) |
| GET | `/api/places/:id` | ID-аар газар авах (READ) |
| POST | `/api/places` | Шинэ газар нэмэх (CREATE) |
| PUT | `/api/places/:id` | Газрын мэдээлэл засах (UPDATE) |
| DELETE | `/api/places/:id` | Газар устгах (DELETE) |
| GET | `/api/users/:userId/places` | Хэрэглэгчийн газруудыг авах |

## CRUD Үйлдлүүд

### CREATE (Үүсгэх)
- Шинэ газар нэмэх: `/add-place` хуудас
- Оролтын validation (нэр, тайлбар, байршил, үнэлгээ, зураг)
- POST `/api/places`

### READ (Унших)
- Бүх газруудыг харах: Нүүр хуудас `/`
- Газрын дэлгэрэнгүй: `/places/:id`
- GET `/api/places` эсвэл GET `/api/places/:id`

### UPDATE (Шинэчлэх)
- Газрын мэдээлэл засах: `/places/:id` дэлгэрэнгүй хуудас дээр
- Зөвхөн өөрийн нэмсэн газрыг засах боломжтой
- PUT `/api/places/:id`

### DELETE (Устгах)
- Газар устгах: `/places/:id` дэлгэрэнгүй хуудас дээр
- Зөвхөн өөрийн нэмсэн газрыг устгах боломжтой
- DELETE `/api/places/:id`

## Онцлог функцүүд

✅ **Нэвтрэх систем** - LocalStorage-д хэрэглэгчийн session хадгална  
✅ **Form Validation** - Оролтын утгуудыг шалгана  
✅ **Protected Routes** - Нэвтэрсэн хэрэглэгч л орох боломжтой  
✅ **Responsive Design** - Бүх төхөөрөмж дээр ажиллана  
✅ **Friends System** - Найзын систем  
✅ **User Profiles** - Хэрэглэгчийн хувийн хуудас

## Дэлгэцүүд

1. **Нүүр хуудас (Home)** - Бүх газруудын жагсаалт
2. **Нэвтрэх (Login)** - Хэрэглэгч нэвтрэх
3. **Газар нэмэх (Add Place)** - Шинэ газар нэмэх
4. **Газрын дэлгэрэнгүй (Place Detail)** - Тухайн газрын мэдээлэл, засах, устгах
5. **Профайл (Profile)** - Хэрэглэгчийн хувийн мэдээлэл
6. **Найзууд (Friends)** - Найзуудын жагсаалт

## Өгөгдлийн бүтэц

### User
\`\`\`javascript
{
  id: string,
  username: string,
  name: string,
  email: string,
  password: string,
  friends: [userId],
  avatar: string (URL),
  createdAt: string (ISO)
}
\`\`\`

### Place
\`\`\`javascript
{
  id: number,
  name: string,
  description: string,
  location: string,
  rating: number (1-5),
  image: string (URL),
  userId: string,
  createdAt: string (ISO)
}
\`\`\`

## Demo Хэрэглэгчид

- **Username:** bold, **Password:** 123456
- **Username:** saraa, **Password:** 123456
- **Username:** erdene, **Password:** 123456
- **Username:** narim, **Password:** 123456

## Анхаарах зүйл

⚠️ Backend server эхлээд ажиллаж байх ёстой  
⚠️ LocalStorage ашигладаггүй (зөвхөн current user session-д)  
⚠️ Өгөгдөл нь server-ийн RAM-д хадгалагдана (server restart хийхэд арилна)  
⚠️ Production-д database ашиглах хэрэгтэй (MongoDB, PostgreSQL гэх мэт)

## Хөгжүүлэлт

\`\`\`bash
# Backend хөгжүүлэлт (auto-restart)
cd server
npm run dev

# Frontend хөгжүүлэлт
npm start
\`\`\`

## License

MIT
