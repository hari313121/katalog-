// --- Data Produk (Contoh) ---
const produkData = [
    {
        id: 1,
        nama: "Risol",
        harga: 3000,
        gambar: "risol.webp"
    },
    {
        id: 2,
        nama: "Cibay",
        harga: 2500,
        gambar: "cibay.webp"
    },
    {
        id: 3,
        nama: "Citung",
        harga: 2500,
        gambar: "citung.webp"
    },
    {
        id: 4,
        nama: "Topokki kecil",
        harga: 5000,
        gambar: "toppoki.webp"
    },
    {
        id: 5,
        nama: "Toppoki besar",
        harga: 10000,
        gambar: "toppoki.webp"
    },
    {
        id: 6,
        nama: "Spaghetti",
        harga: 6000,
        gambar: "spaghetti.webp"
    },
    {
        id: 7,
        nama: "Spaghetti Besar",
        harga: 10000,
        gambar: "spaghetti.webp"
    },
    {
        id: 8,
        nama: "Balungan",
        harga: 5000,
        gambar: "balungan.webp"
    },
    {
        id: 9,
        nama: "Es Teh Jumbo",
        harga: 3000,
        gambar: "esteh.webp"
    }
    {
        id: 9,
        nama: "Es Teh kecil",
        harga: 2000,
        gambar: "esteh.webp"
}
];

// --- Referensi ke Elemen DOM ---
const produkList = document.getElementById('produk-list');
const keranjangItems = document.getElementById('keranjang-items');
const keranjangTotal = document.getElementById('keranjang-total');
const clearKeranjangBtn = document.getElementById('clear-keranjang');
const pesanWhatsappBtn = document.getElementById('pesan-whatsapp');
const namaPemesanInput = document.getElementById('nama-pemesan');
const alamatPemesanInput = document.getElementById('alamat-pemesan');
const keteranganPesananInput = document.getElementById('keterangan-pesanan');
const nominalPembayaranInput = document.getElementById('nominal-pembayaran');
const kembalianDisplay = document.getElementById('kembalian-display');
const manualOrderModal = document.getElementById('manualOrderModal');
const manualProductNameInput = document.getElementById('manualProductName');
const manualProductPriceInput = document.getElementById('manualProductPrice');
const manualProductQtyInput = document.getElementById('manualProductQty');
const printOrderFab = document.getElementById('print-order-fab');
const addManualOrderFab = document.getElementById('add-manual-order-fab');

// --- Variabel Utama ---
let keranjang = [];
let nextManualItemId = 1000; // unik untuk produk manual
let isNominalInputFocused = false;

// --- Default Info Struk ---
const defaultShopName = "HARINFOOD";
const defaultPhoneNumber = "6281235368643";
const defaultFooterText = "Terima Kasih Atas Kunjungannya!";

// --- Fungsi Utilitas ---
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// --- Tampilkan Produk ---
function displayProduk() {
    produkList.innerHTML = '';
    produkData.forEach(produk => {
        const produkDiv = document.createElement('div');
        produkDiv.classList.add('produk-item');
        produkDiv.innerHTML = `
            <img src="${produk.gambar}" alt="${produk.nama}">
            <h3>${produk.nama}</h3>
            <p>Harga: ${formatRupiah(produk.harga)}</p>
            <div class="produk-controls" id="controls-${produk.id}">
                <button class="add-to-cart-btn" data-id="${produk.id}"><i class="fas fa-plus"></i></button>
            </div>
        `;
        produkList.appendChild(produkDiv);
    });

    attachProductControlListeners();
    updateProdukControls();
}

// --- Update Kontrol Produk (Qty, +, -) ---
function updateProdukControls() {
    produkData.forEach(produk => {
        const controlsEl = document.getElementById(`controls-${produk.id}`);
        const itemInCart = keranjang.find(item => item.id === produk.id);

        if (!controlsEl) return;

        if (itemInCart) {
            controlsEl.innerHTML = `
                <button class="qty-control-btn" data-id="${produk.id}" data-action="minus"><i class="fas fa-minus"></i></button>
                <span class="product-qty-display">${itemInCart.qty}</span>
                <button class="qty-control-btn" data-id="${produk.id}" data-action="plus"><i class="fas fa-plus"></i></button>
            `;
        } else {
            controlsEl.innerHTML = `
                <button class="add-to-cart-btn" data-id="${produk.id}"><i class="fas fa-plus"></i></button>
            `;
        }
    });

    attachProductControlListeners();
}

// --- Pasang Event Listener pada Kontrol Produk ---
function attachProductControlListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.removeEventListener('click', handleAddButtonClick);
        button.addEventListener('click', handleAddButtonClick);
    });

    document.querySelectorAll('.qty-control-btn').forEach(button => {
        button.removeEventListener('click', handleQtyControlButtonClick);
        button.addEventListener('click', handleQtyControlButtonClick);
    });
}

// --- Handler Tombol + (Add to Cart) ---
function handleAddButtonClick(e) {
    const produkId = parseInt(e.currentTarget.dataset.id);
    tambahKeKeranjang(produkId);
}

// --- Handler Tombol + dan - (Qty Control) ---
function handleQtyControlButtonClick(e) {
    const produkId = parseInt(e.currentTarget.dataset.id);
    const action = e.currentTarget.dataset.action;
    const itemInCart = keranjang.find(item => item.id === produkId);

    if (itemInCart) {
        if (action === 'plus') {
            itemInCart.qty++;
        } else if (action === 'minus') {
            itemInCart.qty--;
            if (itemInCart.qty <= 0) {
                const indexToRemove = keranjang.indexOf(itemInCart);
                if (indexToRemove > -1) {
                    keranjang.splice(indexToRemove, 1);
                }
            }
        }
        updateKeranjang();
        updateProdukControls();
    }
}

// --- Tambah Produk ke Keranjang ---
function tambahKeKeranjang(produkSumber) {
    let productToAdd;

    if (typeof produkSumber === 'number') {
        productToAdd = produkData.find(p => p.id === produkSumber);
        if (!productToAdd) return;
        productToAdd = { ...productToAdd, qty: 1 };
    } else {
        productToAdd = { ...produkSumber };
    }

    const existingItem = keranjang.find(
        item => item.id === productToAdd.id && item.nama === productToAdd.nama
    );

    if (existingItem) {
        existingItem.qty += productToAdd.qty;
    } else {
        if (productToAdd.isManual) {
            productToAdd.id = nextManualItemId++;
        } else if (produkData.some(p => p.id === productToAdd.id)) {
            // keep id
        } else {
            productToAdd.id = nextManualItemId++;
            productToAdd.isManual = true;
        }
        keranjang.push(productToAdd);
    }
    updateKeranjang();
    updateProdukControls();
}

// --- Update Tampilan Keranjang dan Total Harga ---
function updateKeranjang() {
    let total = 0;
    keranjangItems.innerHTML = '';

    if (keranjang.length === 0) {
        keranjangItems.innerHTML = '<tr><td colspan="4" class="empty-cart-message">Keranjang kosong.</td></tr>';
    } else {
        keranjang.forEach((item, index) => {
            const subtotal = item.harga * item.qty;
            total += subtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nama}</td>
                <td><input type="number" value="${item.qty}" min="1" onchange="updateCartItemQty(${index}, this.value)"></td>
                <td>${formatRupiah(item.harga)}</td>
                <td><button onclick="removeFromCart(${index})" class="btn-remove-item"><i class="fas fa-trash-alt"></i></button></td>
            `;
            keranjangItems.appendChild(row);
        });
    }

    keranjangTotal.textContent = formatRupiah(total);

    // Isi otomatis nominal jika input belum fokus/dikosongkan
    const totalBelanjaNumeric = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
    if (!isNominalInputFocused) {
        const currentNominalValueNumeric = parseFloat(nominalPembayaranInput.value) || 0;
        const isCurrentlyEmptyOrZero = nominalPembayaranInput.value === '' || currentNominalValueNumeric === 0;

        if (isCurrentlyEmptyOrZero || nominalPembayaranInput.dataset.autofilled === 'true') {
            nominalPembayaranInput.value = totalBelanjaNumeric;
            if (totalBelanjaNumeric > 0) {
                nominalPembayaranInput.dataset.autofilled = 'true';
            } else {
                delete nominalPembayaranInput.dataset.autofilled;
            }
        }
    }

    hitungKembalian();
}

// --- Ubah Qty Item Keranjang dari Input ---
window.updateCartItemQty = function(index, newQty) {
    let quantity = parseInt(newQty);
    if (isNaN(quantity) || quantity < 1) {
        quantity = 0;
    }
    if (quantity === 0) {
        keranjang.splice(index, 1);
    } else {
        keranjang[index].qty = quantity;
    }
    updateKeranjang();
    updateProdukControls();
};

// --- Hapus Item dari Keranjang ---
window.removeFromCart = function(index) {
    keranjang.splice(index, 1);
    updateKeranjang();
    updateProdukControls();
};

// --- Bersihkan Keranjang ---
clearKeranjangBtn.addEventListener('click', () => {
    keranjang = [];
    updateKeranjang();
    updateProdukControls();
    nominalPembayaranInput.value = 0;
    delete nominalPembayaranInput.dataset.autofilled;
    hitungKembalian();
});

// --- Hitung Kembalian ---
function hitungKembalian() {
    const totalBelanja = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
    const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
    const kembalian = nominalPembayaran - totalBelanja;
    kembalianDisplay.textContent = formatRupiah(kembalian);
}

// --- Event Listener Nominal Pembayaran ---
nominalPembayaranInput.addEventListener('input', hitungKembalian);
nominalPembayaranInput.addEventListener('focus', function() {
    isNominalInputFocused = true;
});
nominalPembayaranInput.addEventListener('blur', function() {
    isNominalInputFocused = false;
});

// --- Pesan WhatsApp ---
pesanWhatsappBtn.addEventListener('click', function() {
    if (keranjang.length === 0) {
        alert("Keranjang masih kosong.");
        return;
    }
    const namaPemesan = namaPemesanInput.value.trim();
    const alamatPemesan = alamatPemesanInput.value.trim();
    const keteranganPesanan = keteranganPesananInput.value.trim();

    let whatsappMessage = `*${defaultShopName}*\n\n*Pesanan:*\n`;
    keranjang.forEach(item => {
        whatsappMessage += `- ${item.nama} x${item.qty} = ${formatRupiah(item.harga * item.qty)}\n`;
    });
    whatsappMessage += `\n*Total: ${keranjangTotal.textContent}*`;

    if (namaPemesan) whatsappMessage += `\n\n*Nama:* ${namaPemesan}`;
    if (alamatPemesan) whatsappMessage += `\n*Alamat:* ${alamatPemesan}`;
    if (keteranganPesanan) whatsappMessage += `\n*Catatan:*\n${keteranganPesanan}\n`;
    whatsappMessage += `\n${defaultFooterText}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${defaultPhoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    alert('Struk telah disiapkan di WhatsApp. Silakan pilih kontak dan kirim!');
});

// --- FAB Tambah Pesanan Manual ---
addManualOrderFab.addEventListener('click', () => {
    manualOrderModal.style.display = 'flex';
    manualProductNameInput.value = '';
    manualProductPriceInput.value = '';
    manualProductQtyInput.value = '1';
});
window.closeManualOrderModal = function() {
    manualOrderModal.style.display = 'none';
};

// --- Tambah Manual ke Keranjang ---
window.addManualOrderItem = function() {
    const name = manualProductNameInput.value.trim();
    const price = parseFloat(manualProductPriceInput.value);
    const qty = parseInt(manualProductQtyInput.value);

    if (!name || isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) {
        alert('Mohon lengkapi semua bidang dengan nilai yang valid (harga & kuantitas harus positif).');
        return;
    }

    const manualProduct = {
        id: nextManualItemId++,
        nama: name,
        harga: price,
        qty: qty,
        isManual: true
    };

    tambahKeKeranjang(manualProduct);
    closeManualOrderModal();
};

// --- Inisialisasi ---
displayProduk();
updateKeranjang();
hitungKembalian();
manualOrderModal.style.display = 'none';
