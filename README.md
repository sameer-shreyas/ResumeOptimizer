# ResumeOptim.AI - Production-Ready Resume Analysis Platform

A comprehensive AI-powered resume analysis platform that provides ATS compatibility scoring, semantic analysis, and actionable improvement suggestions.

## 🏗️ Architecture Overview

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Features**: 
  - Drag-and-drop file upload
  - Real-time analysis progress
  - Interactive results dashboard
  - Responsive design

### Backend (ASP.NET Core 8)
- **Framework**: ASP.NET Core Web API
- **Database**: SQL Server with Entity Framework Core
- **Caching**: Redis for performance optimization
- **Background Jobs**: Hangfire for async processing
- **File Storage**: Azure Blob Storage
- **Logging**: Serilog with structured logging
- **Validation**: FluentValidation

### AI Microservice (Python FastAPI)
- **Framework**: FastAPI with async support
- **NLP Models**: 
  - sentence-transformers for semantic analysis
  - spaCy for text processing and NER
  - scikit-learn for TF-IDF analysis
  - NLTK for text preprocessing
- **Analysis Pipeline**:
  1. Text extraction and preprocessing
  2. Keyword matching and analysis
  3. Semantic similarity scoring
  4. Resume structure evaluation
  5. Multi-weighted scoring algorithm
  6. Intelligent suggestion generation

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- .NET 8 SDK (for local development)
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Running with Docker Compose

1. **Clone the repository**
```bash
git clone <repository-url>
cd resumeoptim-ai
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000
- Hangfire Dashboard: http://localhost:5000/hangfire

### Local Development Setup

#### Frontend
```bash
npm install
npm run dev
```

#### Backend
```bash
cd backend/ResumeOptim.API
dotnet restore
dotnet run
```

#### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload
```

## 📊 Features

### Core Analysis Features
- **Multi-stage AI Pipeline**: Combines keyword matching, semantic analysis, and structural evaluation
- **ATS Compatibility Scoring**: 0-100 score with detailed breakdown
- **Intelligent Suggestions**: Actionable recommendations with examples
- **File Support**: PDF and DOCX resume parsing
- **Real-time Processing**: Background job processing with status updates

### Advanced Features
- **Semantic Similarity**: Uses transformer models for contextual understanding
- **Industry-Specific Scoring**: Weighted scoring based on job requirements
- **Structure Analysis**: ATS-friendly formatting validation
- **Caching System**: Redis caching for improved performance
- **Audit Logging**: Comprehensive logging for monitoring and debugging

### Security & Compliance
- **Data Anonymization**: Automatic PII redaction before AI processing
- **File Validation**: Strict file type and size validation
- **Rate Limiting**: API abuse prevention
- **Secure Storage**: Azure Blob Storage with proper access controls

## 🔧 Configuration

### Environment Variables

#### Backend (.NET)
```bash
ConnectionStrings__DefaultConnection=<sql-server-connection>
ConnectionStrings__Redis=<redis-connection>
AzureBlobStorage__ConnectionString=<azure-storage-connection>
AIService__BaseUrl=<ai-service-url>
```

#### AI Service (Python)
```bash
PYTHONPATH=/app
```

### Database Setup
The application automatically creates the required database schema on startup. For production, run migrations manually:

```bash
cd backend/ResumeOptim.API
dotnet ef database update
```

## 📈 Performance & Scaling

### Current Targets
- **Analysis Time**: < 30 seconds per resume
- **Throughput**: 100 requests/minute
- **Accuracy**: > 85% keyword matching
- **Uptime**: 99.9% availability

### Scaling Strategies
- **Horizontal Scaling**: Multiple AI service instances
- **Caching**: Redis for frequent job descriptions
- **Queue Management**: Hangfire for background processing
- **CDN**: Static asset caching
- **Database Optimization**: Indexed queries and connection pooling

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend/ResumeOptim.API
dotnet test

# Frontend tests
npm test

# AI Service tests
cd ai-service
pytest
```

### Test Coverage
- Unit tests for core business logic
- Integration tests for API endpoints
- AI model validation tests
- Performance benchmarking

## 📦 Deployment

### Production Deployment
1. **Build Docker images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy to cloud provider**
- Azure Container Instances
- AWS ECS/Fargate
- Google Cloud Run
- Kubernetes cluster

### Environment-Specific Configurations
- **Development**: Local SQL Server, Redis, and Azurite
- **Staging**: Cloud databases with test data
- **Production**: Fully managed cloud services with monitoring

## 🔍 Monitoring & Observability

### Logging
- **Structured Logging**: Serilog with JSON formatting
- **Log Aggregation**: Centralized logging with correlation IDs
- **Performance Metrics**: Request timing and throughput monitoring

### Health Checks
- **API Health**: `/health` endpoint for service status
- **Database Health**: Connection and query validation
- **AI Model Health**: Model loading and inference validation

### Alerting
- **Error Rate Monitoring**: Automatic alerts for high error rates
- **Performance Degradation**: Response time threshold alerts
- **Resource Utilization**: CPU, memory, and storage monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- **C#**: Follow Microsoft coding conventions
- **TypeScript**: ESLint with strict configuration
- **Python**: PEP 8 with Black formatting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/swagger`

---
