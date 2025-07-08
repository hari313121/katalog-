document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENSI DOM UTAMA ---
    const loginPopup = document.getElementById('login-popup');
    const btnPelanggan = document.getElementById('btn-pelanggan');
    const btnKasir = document.getElementById('btn-kasir');
    const formPelanggan = document.getElementById('form-pelanggan');
    const formKasir = document.getElementById('form-kasir');
    const namaPelangganLoginInput = document.getElementById('nama-pelanggan-login');
    const alamatPelangganLoginInput = document.getElementById('alamat-pelanggan-login');
    const namaKasirLoginInput = document.getElementById('nama-kasir-login');
    const passwordKasirLoginInput = document.getElementById('password-kasir-login');
    const appContainer = document.getElementById('app-container');
    const kasirFabs = document.getElementById('kasir-fabs'); // Container untuk FABs kasir
    const pesanInfoLabel = document.getElementById('pesan-info-label');
    const paymentChoiceButtons = document.getElementById('payment-choice-buttons'); // Container opsi pembayaran (Tombol 'Pesan' dan QRIS)
    const pesanWhatsappPelangganBtn = document.getElementById('pesan-whatsapp-pelanggan'); // Tombol Pesan (WhatsApp) untuk pelanggan
    const cetakStrukButton = document.getElementById('cetak-struk-button'); // Tombol Cetak Struk (untuk kasir)
    const namaPemesanInput = document.getElementById('nama-pemesan');
    const alamatPemesanInput = document.getElementById('alamat-pemesan');
    const keteranganPesananInput = document.getElementById('keterangan-pesanan'); // Keterangan pesanan
    const nominalPembayaranInput = document.getElementById('nominal-pembayaran');
    const kembalianDisplay = document.getElementById('kembalian-display');
    const produkList = document.getElementById('produk-list');
    const keranjangItems = document.getElementById('keranjang-items');
    const keranjangTotal = document.getElementById('keranjang-total');
    const manualOrderModal = document.getElementById('manualOrderModal');
    const manualProductNameInput = document.getElementById('manualProductName');
    const manualProductPriceInput = document.getElementById('manualProductPrice');
    const manualProductQtyInput = document.getElementById('manualProductQty');
    const barcodeScannerModal = document.getElementById('barcodeScannerModal');
    const barcodeInput = document.getElementById('barcodeInput');
    const scanFeedback = document.getElementById('scan-feedback');
    const submitBarcodeButton = document.getElementById('submitBarcodeButton');
    const addManualOrderFab = document.getElementById('add-manual-order-fab');
    const clearCartFab = document.getElementById('clear-cart-fab');
    const btnBayarQris = document.getElementById('btn-bayar-qris');
    const shareOrderFab = document.getElementById('share-order-fab'); // FAB Share

    // Referensi ke pop-up pilihan cetak
    const printOptionsPopup = document.getElementById('print-options-popup');
    const btnPrintTunai = document.getElementById('btn-print-tunai');
    const btnPrintQris = document.getElementById('btn-print-qris');
    const closePrintPopupBtn = document.getElementById('close-print-popup');


    // --- DATA PRODUK ---
    const produkData = [
        { id: 1, nama: "Risol", harga: 3000, gambar: "risol.webp", barcode: "0674448829853" },
        { id: 2, nama: "Cibay", harga: 2500, gambar: "cibay.webp", barcode: "cibay" },
        { id: 3, nama: "Citung", harga: 2500, gambar: "citung.webp", barcode: "citung" },
        { id: 4, nama: "Topokki", harga: 5000, gambar: "toppoki.webp", barcode: "toppoki" },
        { id: 5, nama: "Tteokbokki Besar", harga: 10000, gambar: "toppoki.webp", barcode: "toppoki10" },
        { id: 6, nama: "Spaghetti", harga: 6000, gambar: "spaghetti.webp", barcode: "spaghetti" },
        { id: 7, nama: "Spaghetti Besar", harga: 10000, gambar: "spaghetti.webp", barcode: "spaghetti10" },
        { id: 8, nama: "Balungan", harga: 5000, gambar: "balungan.webp", barcode: "balungan" },
        { id: 9, nama: "Es Teh Jumbo", harga: 3000, gambar: "esteh.webp", barcode: "esteh" },
        { id: 10, nama: "Es Teh kecil", harga: 2000, gambar: "esteh.webp", barcode: "esteh2" }
    ];

    let keranjang = [];
    let nextManualItemId = 1000;
    let isNominalInputFocused = false;

    // --- SETTING STRUK/WHATSAPP ---
    const defaultShopName = "HARINFOOD";
    const displayPhoneNumber = "081235368643";
    const whatsappPhoneNumber = "6281235368643";
    const defaultAddress = "Jl Ender Rakit - Gedongan";
    const defaultFooterText = "Terima kasih sehat selalu ya";
    const qrisImagePath = "qris.webp"; // Untuk cetak struk lokal
    // Link QRIS ini digunakan untuk teks di pesan share/WhatsApp
    const qrisDownloadLink = "https://drive.google.com/file/d/1XAOms4tVa2jkkkCdXRwbNIGy0dvu7RIk/view?usp=drivesdk"; 


    // --- FUNGSI UNTUK MEMUAT/MENYIMPAN HARGA KE LOCAL STORAGE ---
    function saveHargaProdukToLocalStorage() {
        const hargaMap = produkData.map(p => ({ id: p.id, harga: p.harga }));
        localStorage.setItem('produkHarga', JSON.stringify(hargaMap));
        console.log('Harga produk disimpan ke Local Storage.');
    }

    function loadHargaProdukFromLocalStorage() {
        const storedHarga = localStorage.getItem('produkHarga');
        if (storedHarga) {
            const hargaMap = JSON.parse(storedHarga);
            hargaMap.forEach(storedItem => {
                const produk = produkData.find(p => p.id === storedItem.id);
                if (produk) {
                    produk.harga = storedItem.harga;
                }
            });
            console.log('Harga produk dimuat dari Local Storage.');
        }
    }


    // --- UTILITAS FORMAT RUPIAH ---
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // --- LOGIKA LOGIN ---
    btnPelanggan.addEventListener('click', () => {
        formPelanggan.style.display = 'flex';
        formKasir.style.display = 'none';
        namaPelangganLoginInput.focus();
    });

    btnKasir.addEventListener('click', () => {
        formKasir.style.display = 'flex';
        formPelanggan.style.display = 'none';
        namaKasirLoginInput.focus();
    });

    formPelanggan.addEventListener('submit', (event) => {
        event.preventDefault();
        const nama = namaPelangganLoginInput.value.trim();
        const alamat = alamatPelangganLoginInput.value.trim();

        if (nama && alamat) {
            localStorage.setItem('userRole', 'pelanggan');
            localStorage.setItem('namaPelanggan', nama);
            localStorage.setItem('alamatPelanggan', alamat);
            localStorage.setItem('namaPemesan', nama); // Juga simpan di 'namaPemesan' untuk kompatibilitas
            loginPopup.style.display = 'none';
            appContainer.style.display = 'block';
            kasirFabs.style.display = 'none'; // Pelanggan tidak melihat FAB kasir
            pesanInfoLabel.style.display = 'block'; // Tampilkan info pesan untuk pelanggan
            alert(`Selamat datang, ${nama}! Anda masuk sebagai Pelanggan.`);
            initializeApp();
        } else {
            alert('Harap isi nama dan alamat Anda.');
        }
    });

    formKasir.addEventListener('submit', (event) => {
        event.preventDefault();
        const namaKasir = namaKasirLoginInput.value.trim();
        const passwordKasir = passwordKasirLoginInput.value.trim();

        if (namaKasir === 'Harry' && passwordKasir === '313121') {
            localStorage.setItem('userRole', 'kasir');
            loginPopup.style.display = 'none';
            appContainer.style.display = 'block';
            kasirFabs.style.display = 'block'; // Kasir melihat FAB kasir
            document.getElementById('namaPemesanModal').style.display = 'none';
            pesanInfoLabel.style.display = 'none'; // Sembunyikan info pesan untuk kasir
            alert('Selamat datang, Harry! Anda masuk sebagai Kasir.');
            initializeApp();
        } else {
            alert('Nama kasir atau password salah.');
        }
    });

    // --- MODAL NAMA PEMESAN ---
    function getNamaPemesanFromStorage() {
        return localStorage.getItem('namaPemesan') || '';
    }

    function getAlamatPemesanFromStorage() {
        return localStorage.getItem('alamatPelanggan') || '';
    }

    function autofillNamaPemesanForm() {
        const nama = getNamaPemesanFromStorage();
        const alamat = getAlamatPemesanFromStorage();
        const namaPemesanInputInForm = document.getElementById('nama-pemesan');
        const alamatPemesanInputInForm = document.getElementById('alamat-pemesan');
        if (namaPemesanInputInForm) {
            namaPemesanInputInForm.value = nama;
        }
        if (alamatPemesanInputInForm) {
            alamatPemesanInputInForm.value = alamat;
        }
    }

    document.getElementById('btnSimpanNamaPemesan').onclick = function() {
        var nama = document.getElementById('inputNamaPemesan').value.trim();
        if (nama.length < 2) {
            alert('Nama pemesan wajib diisi!');
            return;
        }
        localStorage.setItem('namaPemesan', nama);
        localStorage.setItem('namaPelanggan', nama);
        namaPemesanModal.style.display = 'none';
        autofillNamaPemesanForm();
    };

    // --- FUNGSI INISIALISASI APLIKASI ---
    function initializeApp() {
        const currentUserRole = localStorage.getItem('userRole');

        loadHargaProdukFromLocalStorage(); 

        if (currentUserRole === 'pelanggan' && !localStorage.getItem('namaPemesan')) {
            namaPemesanModal.style.display = 'flex';
            inputNamaPemesan.focus();
        } else if (currentUserRole === 'kasir') {
            namaPemesanModal.style.display = 'none';
        }

        autofillNamaPemesanForm();
        displayProduk();
        updateKeranjang();
        hitungKembalian();

        // Mengatur visibilitas FABs kasir
        if (currentUserRole === 'kasir') {
            kasirFabs.style.display = 'block'; 
            pesanInfoLabel.style.display = 'none'; 
            shareOrderFab.style.display = 'flex'; 
        } else {
            kasirFabs.style.display = 'none';
            pesanInfoLabel.style.display = 'block'; 
            shareOrderFab.style.display = 'none'; 
        }

        updateActionButtonVisibility(); 
        paymentChoiceButtons.style.display = 'flex'; 
    }

    // --- INISIALISASI AWAL PADA DOMContentLoaded ---
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) { // Jika sudah ada role tersimpan (sudah pernah login)
        loginPopup.style.display = 'none';
        appContainer.style.display = 'block';
        // Set visibilitas awal FABs dan tombol cetak saat halaman dimuat jika sudah login
        if (storedRole === 'kasir') {
            kasirFabs.style.display = 'block';
            cetakStrukButton.style.display = 'block'; 
            pesanInfoLabel.style.display = 'none'; 
            shareOrderFab.style.display = 'flex'; 
        } else {
            kasirFabs.style.display = 'none';
            cetakStrukButton.style.display = 'none'; 
            pesanInfoLabel.style.display = 'block'; 
            shareOrderFab.style.display = 'none'; 
        }
        initializeApp(); 
    } else { // Belum login
        loginPopup.style.display = 'flex'; 
        appContainer.style.display = 'none';
    }


    // --- RENDER PRODUK + KONTROL QTY ---
    function displayProduk() {
        produkList.innerHTML = '';
        const currentUserRole = localStorage.getItem('userRole'); // Dapatkan peran pengguna saat ini

        produkData.forEach(produk => {
            let itemInCart = keranjang.find(item => item.id === produk.id && !item.isManual);
            let qty = itemInCart ? itemInCart.qty : 0;
            const produkDiv = document.createElement('div');
            produkDiv.classList.add('produk-item');

            let hargaDisplayHtml = `<p>Harga: <span class="price-display">${formatRupiah(produk.harga)}</span></p>`;

            // Jika peran adalah kasir, tampilkan input harga
            if (currentUserRole === 'kasir') {
                hargaDisplayHtml = `
                    <p class="edit-price-wrapper">
                        Harga: 
                        <input type="number" 
                               class="product-price-input" 
                               data-id="${produk.id}" 
                               value="${produk.harga}" 
                               min="0" 
                               onchange="handlePriceChange(this, ${produk.id})"
                               onblur="formatPriceInput(this)">
                    </p>
                `;
            }

            produkDiv.innerHTML = `
                <img src="${produk.gambar}" alt="${produk.nama}">
                <h3>${produk.nama}</h3>
                ${hargaDisplayHtml} 
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

    // --- FUNGSI UNTUK MENANGANI PERUBAHAN HARGA ---
    window.handlePriceChange = function(inputElement, produkId) {
        let newPrice = parseFloat(inputElement.value);
        if (isNaN(newPrice) || newPrice < 0) {
            newPrice = 0; // Pastikan harga tidak negatif
        }
        
        const produk = produkData.find(p => p.id === produkId);
        if (produk) {
            produk.harga = newPrice;
            saveHargaProdukToLocalStorage(); // Simpan perubahan ke Local Storage
            updateKeranjang(); // Perbarui keranjang jika ada item ini
        }
    };

    // FUNGSI UNTUK MEMFORMAT INPUT HARGA SAAT BLUR
    window.formatPriceInput = function(inputElement) {
        let value = parseFloat(inputElement.value);
        if (isNaN(value)) {
            value = 0;
        }
        inputElement.value = value; // Pastikan hanya angka utuh
    };


    // --- EVENT QTY CONTROL DI MENU (DELEGASI) ---
    produkList.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const produkId = parseInt(btn.dataset.id);

        if (btn.classList.contains('add-to-cart-btn')) {
            const product = produkData.find(p => p.id === produkId);
            if (product) {
                tambahKeKeranjang(product);
            }
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

        if (produkSumber.isManual) {
            productToAdd = { ...produkSumber };
        } else {
            const existingItem = keranjang.find(item => {
                if (!item.isManual && item.id === produkSumber.id) {
                    return true;
                }
                if (produkSumber.barcode && item.barcode && item.barcode === produkSumber.barcode) {
                    return true;
                }
                return false;
            });

            if (existingItem) {
                existingItem.qty += (produkSumber.qty || 1);
                updateKeranjang();
                updateProdukControls();
                return;
            } else {
                productToAdd = { ...produkSumber };
                productToAdd.qty = produkSumber.qty || 1;
            }
        }

        if (productToAdd.isManual && !productToAdd.hasOwnProperty('id')) {
            productToAdd.id = nextManualItemId++;
        } else if (!productToAdd.hasOwnProperty('id') && !productToAdd.barcode) {
             productToAdd.id = nextManualItemId++;
             productToAdd.isManual = true;
        }
        
        keranjang.push(productToAdd);
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
        const totalBelanjaNumeric = total;
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
        updateActionButtonVisibility(); 
    });

    // --- HITUNG KEMBALIAN ---
    function hitungKembalian() {
        const totalBelanja = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;
        kembalianDisplay.textContent = formatRupiah(kembalian);
        kembalianDisplay.style.color = kembalian < 0 ? 'var(--danger-color)' : 'var(--text-price-color)';
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

    // --- FUNGSI CETAK STRUK UTAMA (dipanggil oleh cetakStrukButton, Tunai, dan QRIS) ---
    function printStruk(paymentMethod) {
        const namaPemesan = namaPemesanInput.value.trim();
        const alamatPemesan = alamatPemesanInput.value.trim();
        const keteranganPesanan = keteranganPesananInput.value.trim();

        const totalBelanja = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;

        if (keranjang.length === 0) {
            alert('Keranjang belanja masih kosong!');
            return false;
        }
        if (nominalPembayaran < totalBelanja && paymentMethod === 'Tunai') {
            alert('Nominal pembayaran kurang dari total belanja.');
            return false;
        }
        
        const opsiMakan = '-'; 
        
        const tanggalWaktu = new Date();
        const formattedDate = tanggalWaktu.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = tanggalWaktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let printContent = `
            <html>
            <head>
                <title>Struk Belanja</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                <div id="print-area">
                    <div class="print-header">
                        <p class="shop-name-print">${defaultShopName}</p>
                        <p class="shop-address-print">${defaultAddress}</p>
                        <p class="shop-phone-print">${displayPhoneNumber}</p>
                    </div>
                    <div class="print-info">
                        <p>Pelanggan: ${namaPemesan || '-'}</p>
                        <p>Alamat: ${alamatPemesan || '-'}</p>
                        <p>Tanggal: ${formattedDate}</p>
                        <p>Jam: ${formattedTime}</p>
                        
                    </div>
        `;
        if (keteranganPesanan) { // Tambahkan keterangan pesanan jika ada
            printContent += `
                    <div class="print-notes">
                        <p>Catatan: ${keteranganPesanan}</p>
                    </div>
            `;
        }
        printContent += `
                    <hr>
                    <table><tbody>
        `;
        keranjang.forEach(item => {
            printContent += `<tr><td>${item.nama} (${item.qty}x)</td><td style="text-align:right;">${formatRupiah(item.harga)}</td></tr>`;
        });
        printContent += `
                    </tbody></table>
                    <hr>
                    <p class="total-row"><span>TOTAL:</span> ${formatRupiah(totalBelanja)}</p>
                    <p class="print-payment-info"><span>Metode:</span> ${paymentMethod}</p>
                    <p class="print-payment-info"><span>BAYAR:</span> ${formatRupiah(nominalPembayaran)}</p>
                    <p class="print-payment-info"><span>KEMBALIAN:</span> ${formatRupiah(kembalian)}</p>
        `;

        // Sertakan QRIS hanya jika metode pembayaran QRIS
        if (paymentMethod === 'QRIS') {
            printContent += `
                    <div style="text-align: center; margin-top: 10px; margin-bottom: 5px;">
                        <img src="${qrisImagePath}" alt="QRIS Code" style="width: 45mm; height: auto; display: block; margin: 0 auto; padding-bottom: 5px;">
                    </div>
            `;
            printContent += `<p class="thank-you">${defaultFooterText} - Scan QRIS Untuk Pembayaran</p>`;
        } else { // Jika Tunai, tidak ada gambar QRIS
            printContent += `<p class="thank-you">${defaultFooterText}</p>`;
        }

        printContent += `</div></body></html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            // Setelah cetak, bersihkan keranjang dan reset form
            keranjang = [];
            updateKeranjang();
            namaPemesanInput.value = '';
            alamatPemesanInput.value = '';
            keteranganPesananInput.value = ''; // Reset keterangan
            nominalPembayaranInput.value = 0;
            hitungKembalian();
            paymentChoiceButtons.style.display = 'flex'; 
            updateActionButtonVisibility(); 
        }, 300);
        return true;
    }

    // --- FUNGSI KIRIM PESAN WHATSAPP ---
    function kirimWhatsappMessage(paymentMethod) {
        const namaPemesan = namaPemesanInput.value.trim();
        const alamatPemesan = alamatPemesanInput.value.trim();
        const keteranganPesanan = keteranganPesananInput.value.trim(); // Ambil nilai keterangan

        const totalBelanja = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;

        if (keranjang.length === 0) {
            alert('Keranjang belanja masih kosong, tidak bisa pesan via WhatsApp!');
            return false;
        }
        if (nominalPembayaran < totalBelanja && paymentMethod === 'Tunai') {
            alert('Nominal pembayaran kurang dari total belanja.');
            return false;
        }

        const opsiMakan = '-'; 
        
        const tanggalWaktu = new Date();
        const formattedDate = tanggalWaktu.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = tanggalWaktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let whatsappMessage = `*${defaultShopName}*\n`;
        whatsappMessage += `Telp: ${displayPhoneNumber}\n`;
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
        whatsappMessage += `*Total: ${formatRupiah(totalBelanja)}*\n`;
        
        if (paymentMethod === 'QRIS') {
            whatsappMessage += `*Metode Pembayaran: QRIS*\n`;
            whatsappMessage += `\nSilakan scan QRIS untuk pembayaran: ${qrisDownloadLink}\n`; 
            whatsappMessage += `(Abaikan nominal bayar/kembalian jika Anda menggunakan QRIS)\n`;
        } else { 
            whatsappMessage += `*Metode Pembayaran: Tunai*\n`;
            whatsappMessage += `*Bayar: ${formatRupiah(nominalPembayaran)}*\n`;
        }
        
        if (keteranganPesanan) { 
            whatsappMessage += `*Catatan:*\n${keteranganPesanan}\n\n`;
        }
        whatsappMessage += defaultFooterText;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/${whatsappPhoneNumber}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
        alert('Pesan WhatsApp telah disiapkan. Silakan pilih kontak dan kirim!');
        updateActionButtonVisibility();
    }

    // --- Fungsi untuk mengupdate visibilitas tombol aksi (WhatsApp/Cetak) ---
    // Dipanggil setelah transaksi selesai atau inisialisasi
    function updateActionButtonVisibility() {
        const currentUserRole = localStorage.getItem('userRole');
        if (currentUserRole === 'pelanggan') {
            pesanWhatsappPelangganBtn.style.display = 'flex'; 
            cetakStrukButton.style.display = 'none';      
        } else { // Kasir
            pesanWhatsappPelangganBtn.style.display = 'none';  
            cetakStrukButton.style.display = 'block';          
        }
    }


    // --- Event Listener untuk Tombol 'Pesan' (WhatsApp) Pelanggan ---
    pesanWhatsappPelangganBtn.addEventListener('click', () => {
        if (keranjang.length === 0) {
            alert('Keranjang belanja kosong. Harap tambahkan produk.');
            return;
        }
        kirimWhatsappMessage('Tunai'); 
    });

    // Event Listener untuk Tombol QRIS (Tidak berubah)
    btnBayarQris.addEventListener('click', () => {
        if (keranjang.length === 0) {
            alert('Keranjang belanja kosong. Harap tambahkan produk.');
            return;
        }
        kirimWhatsappMessage('QRIS');
    });

    // --- Event Listener untuk Tombol CETAK STRUK (hanya untuk Kasir) ---
    cetakStrukButton.addEventListener('click', () => {
        if (keranjang.length === 0) {
            alert('Keranjang belanja kosong. Tidak ada yang bisa dicetak.');
            return;
        }
        printOptionsPopup.style.display = 'flex';
    });

    // --- Event Listener untuk pilihan di pop-up Cetak Struk ---
    btnPrintTunai.addEventListener('click', () => {
        printOptionsPopup.style.display = 'none';
        printStruk('Tunai');
    });

    btnPrintQris.addEventListener('click', () => {
        printOptionsPopup.style.display = 'none';
        printStruk('QRIS');
    });

    closePrintPopupBtn.addEventListener('click', () => {
        printOptionsPopup.style.display = 'none';
    });


    // --- MODAL & PESANAN MANUAL ---
    addManualOrderFab.addEventListener('click', () => {
        manualOrderModal.style.display = 'flex';
        manualProductNameInput.value = '';
        manualProductPriceInput.value = '';
        manualProductQtyInput.value = '1';
        manualProductNameInput.focus();
    });
    window.closeManualOrderModal = function() {
        manualOrderModal.style.display = 'none';
    };
    window.addManualOrderItem = function() {
        const name = manualProductNameInput.value.trim();
        const price = parseFloat(manualProductPriceInput.value);
        const qty = parseInt(manualProductQtyInput.value);

        if (!name || isNaN(price) || price < 0 || isNaN(qty) || qty < 1) {
            alert('Harap isi nama produk, harga (minimal 0), dan kuantitas (minimal 1) dengan benar.');
            return;
        }

        const newManualItem = {
            id: nextManualItemId++, 
            nama: name,
            harga: price,
            qty: qty,
            isManual: true 
        };
        tambahKeKeranjang(newManualItem);
        manualOrderModal.style.display = 'none';
    };

    // --- BARCODE SCANNER MODAL ---
    document.getElementById('scan-barcode-fab').addEventListener('click', () => {
        barcodeScannerModal.style.display = 'flex';
        barcodeInput.value = ''; 
        scanFeedback.textContent = 'Siap menerima barcode...';
        barcodeInput.focus(); 
    });

    window.closeBarcodeScannerModal = function() {
        barcodeScannerModal.style.display = 'none';
    };

    // Auto-submit saat Enter di barcode input
    barcodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            submitBarcodeButton.click();
        }
    });

    submitBarcodeButton.addEventListener('click', () => {
        const barcodeValue = barcodeInput.value.trim();
        if (barcodeValue) {
            const product = produkData.find(p => p.barcode === barcodeValue);
            if (product) {
                tambahKeKeranjang(product);
                scanFeedback.textContent = `Produk "${product.nama}" ditambahkan!`;
                barcodeInput.value = ''; 
                barcodeInput.focus(); 
            } else {
                scanFeedback.textContent = `Barcode "${barcodeValue}" tidak ditemukan.`;
            }
        } else {
            scanFeedback.textContent = 'Harap masukkan barcode.';
        }
    });

    // --- FAB SHARE ORDER (MERAH) ---
    shareOrderFab.addEventListener('click', async () => {
        // Panggil generateShareMessage dengan metode 'Tunai' untuk menghasilkan teks seperti print Tunai
        const shareResult = generateShareMessage('Tunai'); 

        if (!shareResult.success) {
            alert(shareResult.message);
            return;
        }

        const messageToShare = shareResult.message;
        const totalBelanja = shareResult.total;
        const nominalPembayaran = shareResult.nominal;
        
        if (totalBelanja === 0) { // Jika tidak ada item di keranjang, tidak ada transaksi untuk dibagikan
            alert('Keranjang belanja kosong. Tidak ada transaksi untuk dibagikan.');
            return;
        }

        // Pastikan nominal pembayaran sudah cukup atau transaksi sudah selesai
        if (nominalPembayaran < totalBelanja) {
            alert('Nominal pembayaran kurang dari total belanja. Harap selesaikan pembayaran sebelum membagikan transaksi.');
            return;
        }

        // --- Perubahan di sini: Tidak lagi mencoba menyematkan gambar secara langsung ---
        try {
            // Coba gunakan Web Share API untuk berbagi teks saja
            if (navigator.share) {
                await navigator.share({
                    title: 'Detail Transaksi HARINFOOD',
                    text: messageToShare // Hanya berbagi teks
                });
                console.log('Konten berhasil dibagikan menggunakan Web Share API.');
                // Setelah berhasil berbagi, bersihkan keranjang dan reset form
                keranjang = [];
                updateKeranjang();
                namaPemesanInput.value = '';
                alamatPemesanInput.value = '';
                keteranganPesananInput.value = ''; 
                nominalPembayaranInput.value = 0;
                hitungKembalian();
                updateActionButtonVisibility(); 
                return; // Keluar setelah berhasil berbagi
            }
        } catch (error) {
            console.error('Gagal berbagi via Web Share API:', error);
            // Lanjutkan ke fallback WhatsApp jika Web Share API gagal/dibatalkan
        }

        // Fallback ke WhatsApp jika Web Share API tidak didukung atau gagal
        alert('Tidak dapat membagikan langsung ke aplikasi lain. Menggunakan WhatsApp sebagai gantinya.');
        const encodedMessage = encodeURIComponent(messageToShare);
        const whatsappURL = `https://wa.me/${whatsappPhoneNumber}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');

        // Setelah berbagi via WhatsApp, bersihkan keranjang dan reset form
        keranjang = [];
        updateKeranjang();
        namaPemesanInput.value = '';
        alamatPemesanInput.value = '';
        keteranganPesananInput.value = ''; 
        nominalPembayaranInput.value = 0;
        hitungKembalian();
        updateActionButtonVisibility(); 
    });

    // Fungsi untuk menghasilkan pesan transaksi yang bisa dibagikan
    // (Sekarang menerima parameter paymentMethodForShare untuk konsistensi dengan kirimWhatsappMessage)
    function generateShareMessage(paymentMethodForShare) { 
        const namaPemesan = namaPemesanInput.value.trim();
        const alamatPemesan = alamatPemesanInput.value.trim();
        const keteranganPesanan = keteranganPesananInput.value.trim();

        const totalBelanja = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;

        if (keranjang.length === 0) {
            return { success: false, message: 'Keranjang belanja kosong, tidak bisa dibagikan!' };
        }
        
        const opsiMakan = '-'; 
        
        const tanggalWaktu = new Date();
        const formattedDate = tanggalWaktu.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = tanggalWaktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let shareText = `*${defaultShopName}*\n`;
        shareText += `${defaultAddress}\n`; // Ditambahkan: Alamat toko
        shareText += `Telp: ${displayPhoneNumber}\n`;
        shareText += "-----------------------------\n";
        shareText += `Pelanggan: ${namaPemesan || '-'}\n`;
        shareText += `Alamat: ${alamatPemesan || '-'}\n`;
        shareText += `Tanggal: ${formattedDate}\n`;
        shareText += `Jam: ${formattedTime}\n`;
        shareText += "-----------------------------\n";
        shareText += "*Detail Pesanan:*\n";
        keranjang.forEach(item => {
            shareText += `- ${item.nama} (${item.qty}x) ${formatRupiah(item.harga)}\n`;
        });
        shareText += "-----------------------------\n";
        shareText += `*Total: ${formatRupiah(totalBelanja)}*\n`;
        
        // Logika untuk metode pembayaran, sesuai dengan kirimWhatsappMessage
        if (paymentMethodForShare === 'QRIS') {
            shareText += `*Metode Pembayaran: QRIS*\n`;
            shareText += `\nSilakan scan QRIS untuk pembayaran: ${qrisDownloadLink}\n`; // Menggunakan link view
            shareText += `(Abaikan nominal bayar/kembalian jika Anda menggunakan QRIS)\n`;
        } else { // Jika Tunai atau metode lain yang tidak spesifik
            shareText += `*Metode Pembayaran: Tunai*\n`;
            shareText += `*Bayar: ${formatRupiah(nominalPembayaran)}*\n`;
            shareText += `*Kembalian: ${formatRupiah(kembalian)}*\n\n`;
        }
        
        if (keteranganPesanan) {
            shareText += `*Catatan:*\n${keteranganPesanan}\n\n`;
        }
        // Jika metode Tunai, dan ada total belanja, tambahkan info QRIS sebagai pilihan lain
        // Ini memastikan link QRIS selalu ada di pesan share meskipun transaksi di-share sebagai Tunai
        if (totalBelanja > 0 && paymentMethodForShare === 'Tunai') {
             shareText += `\n*Pilihan Lain: Scan QRIS untuk Pembayaran:*\n${qrisDownloadLink}\n`;
        }

        shareText += defaultFooterText;

        return { success: true, message: shareText, total: totalBelanja, nominal: nominalPembayaran };
    }

}); // Akhir dari DOMContentLoaded
