# Contributing to Brolostack

Thank you for your interest in contributing to Brolostack! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)
- [Testing](#testing)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/brolostack.git
cd brolostack

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Development Commands

```bash
# Start development mode with watch
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Run all tests
npm test

# Run linting
npm run lint
```

## Making Changes

### Branch Naming

Use descriptive branch names that indicate the type of change:

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(storage): add encryption support for local storage
fix(ai): resolve memory leak in AI agent cleanup
docs(api): update API documentation for new endpoints
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use async/await instead of promises where possible

### File Structure

```
src/
├── core/           # Core framework logic
├── storage/        # Storage adapters
├── api/            # API layer
├── ai/             # AI integration
├── utils/          # Utility functions
├── types/          # TypeScript definitions
└── react/          # React integration
```

## Pull Request Process

1. **Create a Pull Request**: Use the GitHub interface to create a PR
2. **Fill out the Template**: Complete all sections of the PR template
3. **Link Issues**: Reference any related issues
4. **Add Tests**: Include tests for new functionality
5. **Update Documentation**: Update relevant documentation
6. **Ensure CI Passes**: All checks must pass before review

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

## Issue Guidelines

### Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Environment**: Browser, OS, Node.js version
4. **Code Sample**: Minimal code that reproduces the issue
5. **Error Messages**: Full error messages and stack traces

### Feature Requests

When requesting features, please include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## Documentation

### API Documentation

- All public APIs must have JSDoc comments
- Include examples in documentation
- Update README.md for significant changes
- Add migration guides for breaking changes

### Code Comments

- Use JSDoc for all public functions and classes
- Add inline comments for complex logic
- Keep comments up-to-date with code changes

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

### Writing Tests

- Write tests for all new functionality
- Aim for high test coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Merge after review
5. Create GitHub release
6. Publish to npm

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: support@beunec.com for direct support

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Brolostack! 🚀
