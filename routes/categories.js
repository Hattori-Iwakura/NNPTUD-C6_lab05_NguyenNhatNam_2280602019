var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let { IncrementalId } = require('../utils/IncrementalIdHandler');
let { categories } = require('../utils/categories');
let { data } = require('../utils/data');

// GET all categories - với truy vấn theo name
// /api/v1/categories?name=clothes
router.get('/', function (req, res, next) {
    let nameQuery = req.query.name ? req.query.name : '';
    
    let result = categories.filter(function (category) {
        return (!category.isDeleted) && 
               category.name.toLowerCase().includes(nameQuery.toLowerCase());
    });
    
    res.status(200).send(result);
});

// GET category by slug
// /api/v1/categories/slug/clothes
router.get('/slug/:slug', function (req, res, next) {
    let slug = req.params.slug;
    
    let result = categories.find(function (category) {
        return (!category.isDeleted) && category.slug == slug;
    });
    
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({
            message: "SLUG NOT FOUND"
        });
    }
});

// GET all products by category ID
// /api/v1/categories/{id}/products
router.get('/:id/products', function (req, res, next) {
    let categoryId = parseInt(req.params.id);
    
    // Kiểm tra xem category có tồn tại không
    let category = categories.find(function (cat) {
        return (!cat.isDeleted) && cat.id == categoryId;
    });
    
    if (!category) {
        return res.status(404).send({
            message: "CATEGORY NOT FOUND"
        });
    }
    
    // Lọc tất cả products có category.id tương ứng
    let result = data.filter(function (product) {
        return (!product.isDeleted) && product.category.id == categoryId;
    });
    
    res.status(200).send(result);
});

// GET category by ID
// /api/v1/categories/7
router.get('/:id', function (req, res, next) {
    let result = categories.find(function (category) {
        return (!category.isDeleted) && category.id == req.params.id;
    });
    
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

// POST - Create new category
// /api/v1/categories
router.post('/', function (req, res, next) {
    let newCategory = {
        id: IncrementalId(categories),
        name: req.body.name,
        slug: slugify(req.body.name, {
            replacement: '-',
            lower: true,
            locale: 'vi',
        }),
        image: req.body.image,
        creationAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
    };
    
    categories.push(newCategory);
    res.status(201).send(newCategory);
});

// PUT - Edit category
// /api/v1/categories/7
router.put('/:id', function (req, res, next) {
    let result = categories.find(function (category) {
        return category.id == req.params.id;
    });
    
    if (result) {
        let body = req.body;
        let keys = Object.keys(body);
        
        for (const key of keys) {
            if (key === 'name') {
                result.name = body.name;
                // Tự động cập nhật slug khi name thay đổi
                result.slug = slugify(body.name, {
                    replacement: '-',
                    lower: true,
                    locale: 'vi',
                });
            } else if (result[key] !== undefined) {
                result[key] = body[key];
            }
        }
        
        result.updatedAt = new Date(Date.now());
        res.status(200).send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

// DELETE category
// /api/v1/categories/7
router.delete('/:id', function (req, res, next) {
    let result = categories.find(function (category) {
        return category.id == req.params.id;
    });
    
    if (result) {
        result.isDeleted = true;
        res.status(200).send({
            message: "Category deleted successfully",
            category: result
        });
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

module.exports = router;
