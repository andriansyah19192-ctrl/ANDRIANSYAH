/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  UserPlus, 
  Trash2, 
  Building2, 
  Skull, 
  PlusCircle, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calendar,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Warga {
  nama: string;
  nik: string;
  status: 'Tetap' | 'Kontrak';
}

interface Kematian {
  nama: string;
  nik: string;
  tanggal: string;
  keterangan: string;
}

interface Transaksi {
  id: string;
  tanggal: string;
  tipe: 'Masuk' | 'Keluar';
  jumlah: number;
  keterangan: string;
}

type Tab = 'dashboard' | 'warga' | 'iuran' | 'kematian';

// --- Main Component ---

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Data Warga
  const [dataWarga, setDataWarga] = useState<Warga[]>(() => {
    const saved = localStorage.getItem('data_warga');
    return saved ? JSON.parse(saved) : [];
  });

  // Data Kematian
  const [dataKematian, setDataKematian] = useState<Kematian[]>(() => {
    const saved = localStorage.getItem('data_kematian');
    return saved ? JSON.parse(saved) : [];
  });

  // Data Transaksi (Iuran & Kas)
  const [dataTransaksi, setDataTransaksi] = useState<Transaksi[]>(() => {
    const saved = localStorage.getItem('data_transaksi');
    return saved ? JSON.parse(saved) : [];
  });

  // Form States
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [status, setStatus] = useState<'Tetap' | 'Kontrak'>('Tetap');
  
  const [tglMati, setTglMati] = useState('');
  const [ketMati, setKetMati] = useState('');

  const [tipeTrans, setTipeTrans] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [jumlahTrans, setJumlahTrans] = useState<number>(0);
  const [ketTrans, setKetTrans] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('data_warga', JSON.stringify(dataWarga));
  }, [dataWarga]);

  useEffect(() => {
    localStorage.setItem('data_kematian', JSON.stringify(dataKematian));
  }, [dataKematian]);

  useEffect(() => {
    localStorage.setItem('data_transaksi', JSON.stringify(dataTransaksi));
  }, [dataTransaksi]);

  // --- Calculations ---
  const totalWarga = dataWarga.length;
  const wargaTetap = dataWarga.filter(w => w.status === 'Tetap').length;
  const totalMati = dataKematian.length;
  
  const totalMasuk = dataTransaksi.filter(t => t.tipe === 'Masuk').reduce((acc, t) => acc + t.jumlah, 0);
  const totalKeluar = dataTransaksi.filter(t => t.tipe === 'Keluar').reduce((acc, t) => acc + t.jumlah, 0);
  const saldoKas = totalMasuk - totalKeluar;

  // --- Handlers ---
  const handleTambahWarga = () => {
    if (nama && nik) {
      setDataWarga([...dataWarga, { nama, nik, status }]);
      setNama('');
      setNik('');
    } else {
      alert("Harap isi Nama dan NIK!");
    }
  };

  const handleHapusWarga = (index: number) => {
    if (confirm("Hapus data warga ini?")) {
      const newData = [...dataWarga];
      newData.splice(index, 1);
      setDataWarga(newData);
    }
  };

  const handleTambahKematian = () => {
    if (nama && nik && tglMati) {
      setDataKematian([...dataKematian, { nama, nik, tanggal: tglMati, keterangan: ketMati }]);
      // Optionally remove from dataWarga
      if (confirm("Apakah warga ini ingin dihapus dari daftar warga aktif?")) {
        setDataWarga(dataWarga.filter(w => w.nik !== nik));
      }
      setNama('');
      setNik('');
      setTglMati('');
      setKetMati('');
    } else {
      alert("Harap isi Nama, NIK, dan Tanggal!");
    }
  };

  const handleTambahTransaksi = () => {
    if (jumlahTrans > 0 && ketTrans) {
      const newTrans: Transaksi = {
        id: Date.now().toString(),
        tanggal: new Date().toISOString().split('T')[0],
        tipe: tipeTrans,
        jumlah: jumlahTrans,
        keterangan: ketTrans
      };
      setDataTransaksi([newTrans, ...dataTransaksi]);
      setJumlahTrans(0);
      setKetTrans('');
    } else {
      alert("Harap isi Jumlah dan Keterangan!");
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // --- Render Helpers ---

  const renderDashboard = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Warga" value={totalWarga} color="text-slate-800" delay={0} />
        <StatCard title="Warga Tetap" value={wargaTetap} color="text-blue-600" delay={0.1} />
        <StatCard title="Total Kematian" value={totalMati} color="text-red-600" delay={0.2} />
        <StatCard title="Saldo Kas RT" value={formatRupiah(saldoKas)} color="text-green-600" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Citizens */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Warga Terbaru
          </h3>
          <div className="space-y-3">
            {dataWarga.slice(-5).reverse().map((w, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-semibold text-sm">{w.nama}</div>
                  <div className="text-xs text-slate-400">{w.nik}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${w.status === 'Tetap' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  {w.status}
                </span>
              </div>
            ))}
            {dataWarga.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Belum ada data</p>}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wallet size={20} className="text-green-500" /> Transaksi Terakhir
          </h3>
          <div className="space-y-3">
            {dataTransaksi.slice(0, 5).map((t, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {t.tipe === 'Masuk' ? <ArrowUpCircle className="text-green-500" size={18} /> : <ArrowDownCircle className="text-red-500" size={18} />}
                  <div>
                    <div className="font-semibold text-sm">{t.keterangan}</div>
                    <div className="text-xs text-slate-400">{t.tanggal}</div>
                  </div>
                </div>
                <div className={`font-bold text-sm ${t.tipe === 'Masuk' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.tipe === 'Masuk' ? '+' : '-'}{formatRupiah(t.jumlah)}
                </div>
              </div>
            ))}
            {dataTransaksi.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Belum ada transaksi</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWarga = () => (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="text-yellow-500" size={24} />
          <h3 className="text-xl font-bold text-slate-700">Input Data Warga Baru</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputGroup label="Nama Lengkap" value={nama} onChange={setNama} placeholder="Budi Santoso" />
          <InputGroup label="NIK" value={nik} onChange={setNik} placeholder="16 Digit NIK" />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'Tetap' | 'Kontrak')} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none bg-white">
              <option value="Tetap">Warga Tetap</option>
              <option value="Kontrak">Warga Kontrak</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleTambahWarga} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-200 active:scale-95">
              Simpan Data
            </button>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">Database Warga Aktif</h3>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-widest">{dataWarga.length} Entri</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5 border-b font-semibold">Nama</th>
                <th className="p-5 border-b font-semibold">NIK</th>
                <th className="p-5 border-b font-semibold">Status</th>
                <th className="p-5 border-b text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dataWarga.map((w, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-5 font-semibold">{w.nama}</td>
                  <td className="p-5 font-mono text-sm text-slate-500">{w.nik}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${w.status === 'Tetap' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => handleHapusWarga(i)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {dataWarga.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Belum ada data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIuran = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Pemasukan</p>
          <h2 className="text-2xl font-bold text-green-600">{formatRupiah(totalMasuk)}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Pengeluaran</p>
          <h2 className="text-2xl font-bold text-red-600">{formatRupiah(totalKeluar)}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-slate-900">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Saldo Akhir</p>
          <h2 className="text-2xl font-bold text-yellow-500">{formatRupiah(saldoKas)}</h2>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="text-green-500" size={24} />
          <h3 className="text-xl font-bold text-slate-700">Catat Transaksi Baru</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tipe</label>
            <select value={tipeTrans} onChange={(e) => setTipeTrans(e.target.value as 'Masuk' | 'Keluar')} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="Masuk">Pemasukan (Iuran/Donasi)</option>
              <option value="Keluar">Pengeluaran (Operasional)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Jumlah (Rp)</label>
            <input type="number" value={jumlahTrans} onChange={(e) => setJumlahTrans(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <InputGroup label="Keterangan" value={ketTrans} onChange={setKetTrans} placeholder="Contoh: Iuran Bulanan Jan" />
          <div className="flex items-end">
            <button onClick={handleTambahTransaksi} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-200 active:scale-95">
              Simpan Transaksi
            </button>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">Riwayat Transaksi Kas RT</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5 border-b font-semibold">Tanggal</th>
                <th className="p-5 border-b font-semibold">Keterangan</th>
                <th className="p-5 border-b font-semibold">Tipe</th>
                <th className="p-5 border-b font-semibold text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dataTransaksi.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-5 text-sm text-slate-500">{t.tanggal}</td>
                  <td className="p-5 font-medium">{t.keterangan}</td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${t.tipe === 'Masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.tipe}
                    </span>
                  </td>
                  <td className={`p-5 text-right font-bold ${t.tipe === 'Masuk' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.tipe === 'Masuk' ? '+' : '-'}{formatRupiah(t.jumlah)}
                  </td>
                </tr>
              ))}
              {dataTransaksi.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Belum ada riwayat transaksi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderKematian = () => (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Skull className="text-red-500" size={24} />
          <h3 className="text-xl font-bold text-slate-700">Rekap Data Kematian</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputGroup label="Nama Almarhum/ah" value={nama} onChange={setNama} placeholder="Nama Lengkap" />
          <InputGroup label="NIK" value={nik} onChange={setNik} placeholder="NIK" />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tanggal Wafat</label>
            <input type="date" value={tglMati} onChange={(e) => setTglMati(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={handleTambahKematian} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-200 active:scale-95">
              Simpan Data
            </button>
          </div>
        </div>
        <div className="mt-4">
          <InputGroup label="Keterangan Tambahan" value={ketMati} onChange={setKetMati} placeholder="Penyebab atau lokasi pemakaman (opsional)" />
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">Daftar Warga Wafat</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5 border-b font-semibold">Nama</th>
                <th className="p-5 border-b font-semibold">NIK</th>
                <th className="p-5 border-b font-semibold">Tanggal Wafat</th>
                <th className="p-5 border-b font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dataKematian.map((k, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-5 font-semibold text-slate-700">{k.nama}</td>
                  <td className="p-5 font-mono text-sm text-slate-400">{k.nik}</td>
                  <td className="p-5 text-sm text-red-600 font-medium">{k.tanggal}</td>
                  <td className="p-5 text-sm text-slate-500 italic">{k.keterangan || '-'}</td>
                </tr>
              ))}
              {dataKematian.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Belum ada data kematian</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col sticky top-0 md:h-screen">
        <div className="flex items-center gap-3 mb-10">
          <Building2 className="text-yellow-500 w-8 h-8" />
          <h1 className="text-2xl font-bold text-yellow-500 tracking-tight">SI-WARGA</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<Users size={20} />} label="Data Warga" active={activeTab === 'warga'} onClick={() => setActiveTab('warga')} />
          <SidebarLink icon={<Wallet size={20} />} label="Iuran & Kas" active={activeTab === 'iuran'} onClick={() => setActiveTab('iuran')} />
          <SidebarLink icon={<Skull size={20} />} label="Data Kematian" active={activeTab === 'kematian'} onClick={() => setActiveTab('kematian')} />
        </nav>
        <div className="pt-6 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Status Sistem</div>
          <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Online & Aktif
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 capitalize">{activeTab.replace('iuran', 'Iuran & Kas').replace('kematian', 'Data Kematian')}</h2>
            <p className="text-slate-400 text-sm">Manajemen sistem informasi warga RT/RW terpadu.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-white font-bold">A</div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800">Admin RT 01</div>
              <div className="text-[10px] text-slate-400">andriansyah.19192@...</div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'warga' && renderWarga()}
            {activeTab === 'iuran' && renderIuran()}
            {activeTab === 'kematian' && renderKematian()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ title, value, color, delay }: { title: string, value: string | number, color: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>
    </motion.div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        active 
          ? 'bg-yellow-500 text-slate-900 font-bold shadow-lg shadow-yellow-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} 
        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
      />
    </div>
  );
}
