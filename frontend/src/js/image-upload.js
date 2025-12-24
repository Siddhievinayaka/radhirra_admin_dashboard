async function uploadProductImage(productId, imageFile, isMain) {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('image', imageFile);
    formData.append('is_main', isMain);
    
    try {
        const response = await fetch('/api/upload-product-image/', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

class ImageUploader {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const mainImageInput = document.getElementById('mainImage');
        if (mainImageInput) {
            mainImageInput.addEventListener('change', (e) => {
                this.showPreview(e.target.files[0], 'mainImagePreview');
            });
        }

        const subImagesInput = document.getElementById('subImages');
        if (subImagesInput) {
            subImagesInput.addEventListener('change', (e) => {
                this.showMultiplePreview(e.target.files, 'subImagesPreview');
            });
        }

        // Edit modal images
        const editMainImageInput = document.getElementById('editMainImage');
        if (editMainImageInput) {
            editMainImageInput.addEventListener('change', (e) => {
                this.showPreview(e.target.files[0], 'editMainImagePreview');
            });
        }

        const editSubImagesInput = document.getElementById('editSubImages');
        if (editSubImagesInput) {
            editSubImagesInput.addEventListener('change', (e) => {
                this.showMultiplePreview(e.target.files, 'editSubImagesPreview');
            });
        }
    }

    showPreview(file, previewId) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            let preview = document.getElementById(previewId);
            if (!preview) {
                preview = document.createElement('div');
                preview.id = previewId;
                preview.className = 'mt-2';
                document.querySelector(`#${previewId.replace('Preview', '')}`).parentNode.appendChild(preview);
            }
            preview.innerHTML = `<img src="${e.target.result}" class="w-20 h-20 object-cover rounded border">`;
        };
        reader.readAsDataURL(file);
    }

    showMultiplePreview(files, previewId) {
        if (!files.length) return;
        let preview = document.getElementById(previewId);
        if (!preview) {
            preview = document.createElement('div');
            preview.id = previewId;
            preview.className = 'mt-2 flex flex-wrap gap-2';
            document.querySelector(`#${previewId.replace('Preview', '')}`).parentNode.appendChild(preview);
        }
        preview.innerHTML = '';
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-16 h-16 object-cover rounded border';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    async uploadImages(productId) {
        try {
            const mainImageFile = document.getElementById('mainImage')?.files[0];
            if (mainImageFile) {
                await uploadProductImage(productId, mainImageFile, true);
            }

            const subImageFiles = document.getElementById('subImages')?.files;
            if (subImageFiles) {
                for (const file of subImageFiles) {
                    await uploadProductImage(productId, file, false);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    async uploadEditImages(productId) {
        try {
            const editMainImageFile = document.getElementById('editMainImage')?.files[0];
            if (editMainImageFile) {
                await uploadProductImage(productId, editMainImageFile, true);
            }

            const editSubImageFiles = document.getElementById('editSubImages')?.files;
            if (editSubImageFiles) {
                for (const file of editSubImageFiles) {
                    await uploadProductImage(productId, file, false);
                }
            }
        } catch (error) {
            console.error('Edit upload error:', error);
            throw error;
        }
    }

    clearPreviews() {
        ['mainImagePreview', 'subImagesPreview', 'editMainImagePreview', 'editSubImagesPreview'].forEach(id => {
            const preview = document.getElementById(id);
            if (preview) preview.innerHTML = '';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.imageUploader = new ImageUploader();
});