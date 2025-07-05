document.addEventListener('DOMContentLoaded', () => {
    // Data produk HARINFOOD
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
            nama: "Topokki",
            harga: 5000,
            gambar: "toppoki.webp"
        },
        {
            id: 5,
            nama: "Tteokbokki Besar",
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
    ];

    // Referensi ke elemen-elemen DOM utama
    const produkList = document.getElementById('produk-list');
    const keranjangItems = document.getElementById('keranjang-items'); // Ini adalah <tbody> tabel
    const keranjangTotal = document.getElementById('keranjang-total');
    const clearKeranjangBtn = document.getElementById('clear-keranjang');
    
    // Tombol FAB Cetak dan Tambah Manual
    const printOrderFab = document.getElementById('print-order-fab'); 
    const addManualOrderFab = document.getElementById('add-manual-order-fab');

    // Tombol di dalam form pemesanan
    const pesanWhatsappBtn = document.getElementById('pesan-whatsapp');

    // Input form pemesanan
    const namaPemesanInput = document.getElementById('nama-pemesan');
    const alamatPemesanInput = document.getElementById('alamat-pemesan'); 
    const keteranganPesananInput = document.getElementById('keterangan-pesanan'); 

    // Input pembayaran
    const nominalPembayaranInput = document.getElementById('nominal-pembayaran'); 
    const kembalianDisplay = document.getElementById('kembalian-display');     

    // Modal Pesanan Manual
    const manualOrderModal = document.getElementById('manualOrderModal');
    const manualProductNameInput = document.getElementById('manualProductName');
    const manualProductPriceInput = document.getElementById('manualProductPrice');
    const manualProductQtyInput = document.getElementById('manualProductQty');

    let keranjang = []; // Array untuk menyimpan item di keranjang
    let nextManualItemId = 1000; // ID unik untuk item manual (agar tidak bentrok dengan produkData)
    let isNominalInputFocused = false; // Flag untuk melacak fokus pada input nominal pembayaran

    // Informasi default untuk struk (tidak bisa diedit via UI)
    const defaultShopName = "HARINFOOD";
    const defaultPhoneNumber = "6281235368643"; 
    const defaultFooterText = "Terima Kasih Atas Kunjungannya!";

    // Fungsi utilitas untuk memformat angka menjadi Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0 
        }).format(number);
    };

    // Fungsi untuk menampilkan produk di halaman katalog
    function displayProduk() {
        produkList.innerHTML = ''; // Kosongkan daftar produk
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

        // Attach event listeners setelah DOM dimuat ulang
        attachProductControlListeners(); 
        updateProdukControls(); // Panggil ini untuk menampilkan Qty di awal jika ada di keranjang
    }

    // Memisahkan attachment event listener untuk produk controls
    function attachProductControlListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.removeEventListener('click', handleAddButtonClick); // Pastikan tidak ada duplikasi
            button.addEventListener('click', handleAddButtonClick);
        });

        document.querySelectorAll('.qty-control-btn').forEach(button => {
            button.removeEventListener('click', handleQtyControlButtonClick); // Pastikan tidak ada duplikasi
            button.addEventListener('click', handleQtyControlButtonClick);
        });
    }

    // Handler untuk tombol tambah keranjang (ikon + awal)
    function handleAddButtonClick(e) {
        const produkId = parseInt(e.currentTarget.dataset.id); 
        tambahKeKeranjang(produkId); // Tambahkan 1 ke keranjang
    }

    // Handler untuk tombol plus/minus kuantitas di kartu produk
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
            updateKeranjang(); // Perbarui keranjang utama
            updateProdukControls(); // Perbarui tampilan kontrol di kartu produk
        }
    }


    // Fungsi untuk menambahkan produk ke keranjang belanja
    function tambahKeKeranjang(produkSumber) {
        let productToAdd;

        if (typeof produkSumber === 'number') { // Jika produk dari produkData (ID)
            productToAdd = produkData.find(p => p.id === produkSumber);
            if (!productToAdd) return; // Produk tidak ditemukan
            productToAdd = { ...productToAdd, qty: 1 }; // Kloning dan tambahkan qty
        } else { // Jika produk manual (sudah objek dari modal)
            productToAdd = { ...produkSumber }; // Kloning objek untuk menghindari referensi langsung
        }

        // Cek apakah item sudah ada di keranjang berdasarkan ID dan nama (penting untuk produk manual dengan ID yang sama)
        const existingItem = keranjang.find(
            item => item.id === productToAdd.id && item.nama === productToAdd.nama
        );

        if (existingItem) {
            existingItem.qty += productToAdd.qty;
        } else {
            // Beri ID unik baru untuk produk manual jika belum ada atau ID bentrok
            if (productToAdd.isManual) { // Jika sudah ditandai manual, pastikan ID-nya unik
                 productToAdd.id = nextManualItemId++; // Beri ID manual baru yang unik
            } else if (produkData.some(p => p.id === productToAdd.id)) { // Jika ID ini sudah ada di produkData asli, dan ini bukan manual
                // Biarkan ID asli
            } else { // Mungkin ini produk manual yang belum punya isManual dan ID-nya belum ada di produkData
                productToAdd.id = nextManualItemId++;
                productToAdd.isManual = true;
            }
            keranjang.push(productToAdd);
        }
        updateKeranjang();
        updateProdukControls(); // Perbarui kontrol di kartu produk setelah keranjang berubah
    }


    // Fungsi untuk memperbarui tampilan keranjang belanja (tabel) dan total harga
    function updateKeranjang() {
        let total = 0;
        keranjangItems.innerHTML = ''; // Kosongkan tbody

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
        
        // --- Logika pengisian nominal pembayaran otomatis ---
        const totalBelanjaNumeric = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        
        // Hanya isi otomatis jika input TIDAK SEDANG FOKUS dan inputnya kosong atau 0
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
        // --- Akhir logika pengisian nominal pembayaran otomatis ---

        hitungKembalian(); // Selalu hitung kembalian setelah update keranjang
    }


    // Fungsi untuk mengubah kuantitas item di keranjang langsung dari input
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

    // Fungsi untuk menghapus item dari keranjang
    window.removeFromCart = function(index) {
        keranjang.splice(index, 1);
        updateKeranjang(); 
        updateProdukControls();
    };


    // Event listener untuk tombol "Bersihkan Keranjang"
    clearKeranjangBtn.addEventListener('click', () => {
        keranjang = [];
        updateKeranjang();
        updateProdukControls(); // Perbarui juga kontrol produk di kartu menu
        nominalPembayaranInput.value = 0; // Reset nominal pembayaran
        delete nominalPembayaranInput.dataset.autofilled; // Hapus tanda autofilled
        hitungKembalian(); 
    });

    // Fungsi untuk menghitung dan menampilkan kembalian
    function hitungKembalian() {
        const totalBelanja = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        const nominalPembayaran = parseFloat(nominalPembayaranInput.value) || 0;
        const kembalian = nominalPembayaran - totalBelanja;
        kembalianDisplay.textContent = formatRupiah(kembalian);
    }

    // Event listener untuk input nominal pembayaran
    nominalPembayaranInput.addEventListener('input', hitungKembalian);
    
    // --- Event listeners untuk perilaku fokus/blur pada nominal pembayaran ---
    nominalPembayaranInput.addEventListener('focus', () => {
        isNominalInputFocused = true; // Tandai input sedang fokus
        // Hanya kosongkan jika sebelumnya diisi otomatis atau bernilai 0
        if (nominalPembayaranInput.dataset.autofilled === 'true' || parseFloat(nominalPembayaranInput.value) === 0) {
            nominalPembayaranInput.value = '';
            delete nominalPembayaranInput.dataset.autofilled; // Hapus tanda autofilled
        }
    });

    nominalPembayaranInput.addEventListener('blur', () => {
        isNominalInputFocused = false; // Tandai input tidak fokus lagi
        const totalBelanjaNumeric = parseFloat(keranjangTotal.textContent.replace('Rp', '').replace(/\./g, '').replace(',', '.')) || 0;
        // Jika input kosong setelah blur, isi kembali dengan total (kecuali totalnya 0)
        if (nominalPembayaranInput.value === '' && totalBelanjaNumeric > 0) {
            nominalPembayaranInput.value = totalBelanjaNumeric;
            nominalPembayaranInput.dataset.autofilled = 'true'; // Tandai lagi jika diisi ulang otomatis
            hitungKembalian(); // Hitung ulang kembalian
        } else if (nominalPembayaranInput.value === '' && totalBelanjaNumeric === 0) {
            // Jika total 0 dan input kosong, biarkan 0 atau kosong, jangan tandai autofilled
            nominalPembayaranInput.value = 0;
            delete nominalPembayaranInput.dataset.autofilled;
            hitungKembalian();
        }
    });
    // --- Akhir event listeners untuk perilaku fokus/blur ---


    // Event listener untuk FAB Cetak Pesanan
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
        printWindow.document.write(`<p>Pelanggan: ${namaPemesan}</p>`);
        printWindow.document.write(`<p>Alamat: ${alamatPemesan}</p>`);
        printWindow.document.write(`<p>Opsi: ${opsiMakan}</p>`);
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
        // Detail Pembayaran di Struk
        printWindow.document.write('<p class="print-payment-info"><span>BAYAR:</span> ' + formatRupiah(nominalPembayaran) + '</p>');
        printWindow.document.write('<p class="print-payment-info"><span>KEMBALIAN:</span> ' + formatRupiah(kembalian) + '</p>');
        printWindow.document.write(`<p>Pelanggan: ${namaPemesan || '-'}</p>`);
        printWindow.document.write(`<p>Alamat: ${alamatPemesan || '-'}</p>`);

        // Gambar QRIS untuk CETAK (qris.webp)
        printWindow.document.write('<div style="text-align: center; margin-top: 10px; margin-bottom: 5px;">');
        printWindow.document.write('<img src="qris.webp" alt="QRIS Code" style="width: 45mm; height: auto; display: block; margin: 0 auto;">'); 
        printWindow.document.write('</div>');

        // Gabungkan teks QRIS dengan footer
        printWindow.document.write(`<p class="thank-you">${defaultFooterText} - Scan QRIS Untuk Pembayaran</p>`);
        printWindow.document.write('</div></body></html>');
        
        printWindow.document.close(); 
        printWindow.focus(); 
        
        setTimeout(() => {
            printWindow.print();
        }, 500); 

        // Reset keranjang dan form setelah cetak
        keranjang = [];
        updateKeranjang();
        updateProdukControls(); 
        namaPemesanInput.value = '';
        alamatPemesanInput.value = '';
        keteranganPesananInput.value = ''; 
        nominalPembayaranInput.value = 0; 
        document.getElementById('makan-disini').checked = true; 
        hitungKembalian(); 
    });

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
        whatsappMessage += `Pelanggan: ${namaPemesan}\n`;
        whatsappMessage += `Alamat: ${alamatPemesan}\n`;
        whatsappMessage += `Opsi: ${opsiMakan}\n`;
        whatsappMessage += `Tanggal: ${formattedDate}\n`;
        whatsappMessage += `Jam: ${formattedTime}\n`;
        whatsappMessage += "-----------------------------\n";
        whatsappMessage += "*Detail Pesanan:*\n";

        keranjang.forEach(item => {
            whatsappMessage += `- ${item.nama} (${item.qty}x) ${formatRupiah(item.harga)}\n`;
        });

        whatsappMessage += "-----------------------------\n";
        whatsappMessage += `*Total: ${keranjangTotal.textContent}*\n`;
        // Detail Pembayaran di WhatsApp

        whatsappMessage += `Pelanggan: ${namaPemesan || '-'}\n`;
        whatsappMessage += `Alamat: ${alamatPemesan || '-'}\n`;
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

    // Event listener untuk FAB Tambah Pesanan Manual
    addManualOrderFab.addEventListener('click', () => { 
        manualOrderModal.style.display = 'flex'; // Tampilkan modal manual
        manualProductNameInput.value = ''; // Reset input
        manualProductPriceInput.value = '';
        manualProductQtyInput.value = '1';
    });

    // Fungsi untuk menutup modal pesanan manual
    window.closeManualOrderModal = function() {
        manualOrderModal.style.display = 'none';
    };

    // Fungsi untuk menambahkan item manual ke keranjang
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
            isManual: true // Tandai sebagai produk manual
        };

        tambahKeKeranjang(manualProduct); 
        closeManualOrderModal(); 
    };


    // Inisialisasi aplikasi saat DOM selesai dimuat
    displayProduk();
    updateKeranjang();
    hitungKembalian(); // Hitung kembalian di awal
    manualOrderModal.style.display = 'none'; // Pastikan modal tersembunyi
});
