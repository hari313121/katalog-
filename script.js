document.addEventListener('DOMContentLoaded', () => {
    // ... (bagian MODAL NAMA PEMESAN sama seperti sebelumnya) ...
    function getNamaPemesan() {
        return localStorage.getItem('namaPemesan') || '';
    }
    function tampilkanModalNamaPemesan() {
        document.getElementById('namaPemesanModal').style.display = 'flex';
        document.getElementById('inputNamaPemesan').focus();
    }
    function sembunyikanModalNamaPemesan() {
        document.getElementById('namaPemesanModal').style.display = 'none';
    }
    function autofillNamaPemesanForm() {
        const nama = getNamaPemesan();
        const namaPemesanInput = document.getElementById('nama-pemesan');
        if (namaPemesanInput) {
            namaPemesanInput.value = nama;
        }
    }
    if (!localStorage.getItem('namaPemesan')) {
        tampilkanModalNamaPemesan();
    } else {
        autofillNamaPemesanForm();
    }
    document.getElementById('btnSimpanNamaPemesan').onclick = function() {
        var nama = document.getElementById('inputNamaPemesan').value.trim();
        if (nama.length < 2) {
            alert('Nama pemesan wajib diisi!');
            return;
        }
        localStorage.setItem('namaPemesan', nama);
        sembunyikanModalNamaPemesan();
        autofillNamaPemesanForm();
    };

    // --- DATA PRODUK ---
    const produkData = [
        { id: 1, nama: "Risol", harga: 3000, gambar: "risol.webp" },
        { id: 2, nama: "Cibay", harga: 2500, gambar: "cibay.webp" },
        { id: 3, nama: "Citung", harga: 2500, gambar: "citung.webp" },
        { id: 4, nama: "Topokki", harga: 5000, gambar: "toppoki.webp" },
        { id: 5, nama: "Tteokbokki Besar", harga: 10000, gambar: "toppoki.webp" },
        { id: 6, nama: "Spaghetti", harga: 6000, gambar: "spaghetti.webp" },
        { id: 7, nama: "Spaghetti Besar", harga: 10000, gambar: "spaghetti.webp" },
        { id: 8, nama: "Balungan", harga: 5000, gambar: "balungan.webp" },
        { id: 9, nama: "Es Teh Jumbo", harga: 3000, gambar: "esteh.webp" }
        ,
        { id: 10, nama: "Es Teh kecil", harga: 2000, gambar: "esteh.webp" }
    ];

    // --- REFERENSI DOM ---
    const produkList = document.getElementById('produk-list');
    const keranjangItems = document.getElementById('keranjang-items');
    const keranjangTotal = document.getElementById('keranjang-total');
    const printOrderFab = document.getElementById('print-order-fab');
    const addManualOrderFab = document.getElementById('add-manual-order-fab');
    const clearCartFab = document.getElementById('clear-cart-fab');
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

    let keranjang = [];
    let nextManualItemId = 1000;
    let isNominalInputFocused = false;

    // --- SETTING STRUK/WHATSAPP ---
    const defaultShopName = "HARINFOOD";
    const defaultPhoneNumber = "6281235368643";
    const defaultFooterText = "Terima Kasih!";

    // --- UTILITAS FORMAT RUPIAH ---
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // --- RENDER PRODUK + KONTROL QTY ---
    function displayProduk() {
        produkList.innerHTML = '';
        produkData.forEach(produk => {
            let itemInCart = keranjang.find(item => item.id === produk.id && !item.isManual);
            let qty = itemInCart ? itemInCart.qty : 0;
            const produkDiv = document.createElement('div');
            produkDiv.classList.add('produk-item');
            produkDiv.innerHTML = `
                <img src="${produk.gambar}" alt="${produk.nama}">
                <h3>${produk.nama}</h3>
                <p>Harga: ${formatRupiah(produk.harga)}</p>
                <div class="produk-controls" id="controls-${produk.id}">
                    ${
                        qty < 1 ? `
                        <button class="add-to-cart-btn qty-btn" data-id="${produk.id}" title="Tambah ke keranjang"><i class="fas fa-plus"></i></button>
                        ` : `
                        <button class="qty-control-btn qty-btn minus-btn" data-id="${produk.id}" data-action="minus" title="Kurangi qty">-</button>
                        <span class="qty-value">${qty}</span>
                        <button class="qty-control-btn qty-btn plus-btn" data-id="${produk.id}" data-action="plus" title="Tambah qty">+</button>
                        `
                    }
                </div>
            `;
            produkList.appendChild(produkDiv);
        });
    }
    function updateProdukControls() {
        displayProduk();
    }

    // --- EVENT QTY CONTROL DI MENU (DELEGASI) ---
    produkList.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const produkId = parseInt(btn.dataset.id);

        if (btn.classList.contains('add-to-cart-btn')) {
            tambahKeKeranjang(produkId);
            return;
        }
        if (btn.classList.contains('plus-btn')) {
            const itemInCart = keranjang.find(item => item.id === produkId && !item.isManual);
            if (itemInCart) {
                itemInCart.qty++;
                updateKeranjang();
                updateProdukControls();
            }
            return;
        }
        if (btn.classList.contains('minus-btn')) {
            const itemInCart = keranjang.find(item => item.id === produkId && !item.isManual);
            if (itemInCart) {
                itemInCart.qty--;
                if (itemInCart.qty <= 0) {
                    keranjang = keranjang.filter(item => !(item.id === produkId && !item.isManual));
                }
                updateKeranjang();
                updateProdukControls();
            }
            return;
        }
    });

    // --- TAMBAH KE KERANJANG ---
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
                // Biarkan ID asli
            } else {
                productToAdd.id = nextManualItemId++;
                productToAdd.isManual = true;
            }
            keranjang.push(productToAdd);
        }
        updateKeranjang();
        updateProdukControls();
    }

    // --- RENDER KERANJANG BELANJA ---
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

    window.removeFromCart = function(index) {
        keranjang.splice(index, 1);
        updateKeranjang();
        updateProdukControls();
    };

    // --- FAB CLEAR KERANJANG (MERAH) ---
    clearCartFab.addEventListener('click', () => {
        keranjang = [];
        updateKeranjang();
        updateProdukControls();
        nominalPembayaranInput.value = 0;
        delete nominalPembayaranInput.dataset.autofilled;
        hitungKembalian();
    });

    // --- HITUNG KEMBALIAN ---
    function hitungKembalian() {
        const totalBelanja = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;
        kembalianDisplay.textContent = formatRupiah(kembalian);
    }
    nominalPembayaranInput.addEventListener('input', hitungKembalian);

    nominalPembayaranInput.addEventListener('focus', () => {
        isNominalInputFocused = true;
        if (nominalPembayaranInput.dataset.autofilled === 'true' || parseFloat(nominalPembayaranInput.value) === 0) {
            nominalPembayaranInput.value = '';
            delete nominalPembayaranInput.dataset.autofilled;
        }
    });
    nominalPembayaranInput.addEventListener('blur', () => {
        isNominalInputFocused = false;
        const totalBelanjaNumeric = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        if (nominalPembayaranInput.value === '' && totalBelanjaNumeric > 0) {
            nominalPembayaranInput.value = totalBelanjaNumeric;
            nominalPembayaranInput.dataset.autofilled = 'true';
            hitungKembalian();
        } else if (nominalPembayaranInput.value === '' && totalBelanjaNumeric === 0) {
            nominalPembayaranInput.value = 0;
            delete nominalPembayaranInput.dataset.autofilled;
            hitungKembalian();
        }
    });

    // --- CETAK STRUK ---
    printOrderFab.addEventListener('click', () => {
        const namaPemesan = namaPemesanInput.value.trim();
        const alamatPemesan = alamatPemesanInput.value.trim();
        const keteranganPesanan = keteranganPesananInput.value.trim();

        const totalBelanja = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;

        if (keranjang.length === 0) {
            alert('Keranjang belanja masih kosong!');
            return;
        }
        if (nominalPembayaran < totalBelanja) {
            alert('Nominal pembayaran kurang dari total belanja.');
            return;
        }

        const opsiMakan = document.querySelector('input[name="opsi-makan"]:checked').value;
        const tanggalWaktu = new Date();
        const formattedDate = tanggalWaktu.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = tanggalWaktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Struk Belanja</title>');
        printWindow.document.write('<link rel="stylesheet" href="style.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<div id="print-area">');
        printWindow.document.write('<div class="print-header">');
        printWindow.document.write(`<h2>${defaultShopName}</h2>`);
        printWindow.document.write(`<p>Telp: ${defaultPhoneNumber}</p>`);
        printWindow.document.write('</div>');
        printWindow.document.write('<div class="print-info">');
        printWindow.document.write(`<p>Pelanggan: ${namaPemesan || '-'}</p>`);
        printWindow.document.write(`<p>Alamat: ${alamatPemesan || '-'}</p>`);
        printWindow.document.write(`<p>Tanggal: ${formattedDate}</p>`);
        printWindow.document.write(`<p>Jam: ${formattedTime}</p>`);
        printWindow.document.write('</div>');
        if (keteranganPesanan) {
            printWindow.document.write('<div class="print-notes">');
            printWindow.document.write(`<p>Catatan: ${keteranganPesanan}</p>`);
            printWindow.document.write('</div>');
        }
        printWindow.document.write('<hr>');
        printWindow.document.write('<table><tbody>');
        keranjang.forEach(item => {
            printWindow.document.write(`<tr><td>${item.nama} (${item.qty}x)</td><td style="text-align:right;">${formatRupiah(item.harga)}</td></tr>`);
        });
        printWindow.document.write('</tbody></table>');
        printWindow.document.write('<hr>');
        printWindow.document.write('<p class="total-row"><span>TOTAL:</span> ' + keranjangTotal.textContent + '</p>');
        printWindow.document.write('<p class="print-payment-info"><span>BAYAR:</span> ' + formatRupiah(nominalPembayaran) + '</p>');
        printWindow.document.write('<p class="print-payment-info"><span>KEMBALIAN:</span> ' + formatRupiah(kembalian) + '</p>');
        printWindow.document.write('<div style="text-align: center; margin-top: 10px; margin-bottom: 5px;">');
        printWindow.document.write('<img src="qris.webp" alt="QRIS Code" style="width: 45mm; height: auto; display: block; margin: 0 auto;">');
        printWindow.document.write('</div>');
        printWindow.document.write(`<p class="thank-you">${defaultFooterText} - Scan QRIS Untuk Pembayaran</p>`);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
        keranjang = [];
        updateKeranjang();
        updateProdukControls();
        namaPemesanInput.value = '';
        alamatPemesanInput.value = '';
        keteranganPesananInput.value = '';
        nominalPembayaranInput.value = 0;
        document.getElementById('dibawa-pulang').checked = true;
        hitungKembalian();
    });

    // --- PESAN WHATSAPP ---
    pesanWhatsappBtn.addEventListener('click', () => {
        const namaPemesan = namaPemesanInput.value.trim();
        const alamatPemesan = alamatPemesanInput.value.trim();
        const keteranganPesanan = keteranganPesananInput.value.trim();

        const totalBelanja = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;

        if (keranjang.length === 0) {
            alert('Keranjang belanja masih kosong, tidak bisa pesan via WhatsApp!');
            return;
        }
        if (nominalPembayaran < totalBelanja) {
            alert('Nominal pembayaran kurang dari total belanja.');
            return;
        }

        const opsiMakan = document.querySelector('input[name="opsi-makan"]:checked').value;
        const tanggalWaktu = new Date();
        const formattedDate = tanggalWaktu.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = tanggalWaktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let whatsappMessage = `*${defaultShopName}*\n`;
        whatsappMessage += `Telp: ${defaultPhoneNumber}\n`;
        whatsappMessage += "-----------------------------\n";
        whatsappMessage += `Pelanggan: ${namaPemesan || '-'}\n`;
        whatsappMessage += `Alamat: ${alamatPemesan || '-'}\n`;
        whatsappMessage += `Tanggal: ${formattedDate}\n`;
        whatsappMessage += `Jam: ${formattedTime}\n`;
        whatsappMessage += "-----------------------------\n";
        whatsappMessage += "*Detail Pesanan:*\n";
        keranjang.forEach(item => {
            whatsappMessage += `- ${item.nama} (${item.qty}x) ${formatRupiah(item.harga)}\n`;
        });
        whatsappMessage += "-----------------------------\n";
        whatsappMessage += `*Total: ${keranjangTotal.textContent}*\n`;
        whatsappMessage += `*Bayar: ${formatRupiah(nominalPembayaran)}*\n`;
        whatsappMessage += `*Kembalian: ${formatRupiah(kembalian)}*\n\n`;
        if (keteranganPesanan) {
            whatsappMessage += `*Catatan:*\n${keteranganPesanan}\n\n`;
        }
        whatsappMessage += defaultFooterText;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/${defaultPhoneNumber}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
        alert('Struk telah disiapkan di WhatsApp. Silakan pilih kontak dan kirim!');
    });

    // --- MODAL & PESANAN MANUAL ---
    addManualOrderFab.addEventListener('click', () => {
        manualOrderModal.style.display = 'flex';
        manualProductNameInput.value = '';
        manualProductPriceInput.value = '';
        manualProductQtyInput.value = '1';
    });
    window.closeManualOrderModal = function() {
        manualOrderModal.style.display = 'none';
    };
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

    // --- INISIALISASI APP ---
    displayProduk();
    updateKeranjang();
    hitungKembalian();
    manualOrderModal.style.display = 'none';
});
// ...kode-kode fungsi lain...

// Fungsi hidePilihanMakan:
function hidePilihanMakan() {
    const opsiIds = [
        { id: "dibawa-pulang", labelText: "Dibawa Pulang" },
        { id: "makan-disini", labelText: "Makan di Sini" }
    ];
    opsiIds.forEach(opsi => {
        const radio = document.getElementById(opsi.id);
        if (radio) radio.style.display = 'none';
        const label = document.querySelector(`label[for='${opsi.id}']`);
        if (label) label.style.display = 'none';
    });
}

// Jalankan saat halaman sudah siap
document.addEventListener('DOMContentLoaded', hidePilihanMakan);

// -- kode lain (misal event listener global, dsb) --