# Final Project 
# Deskripsi
  Tugas ini merupakan implementasi jaringan berbasis Software Defined Networking menggunakan dua VM: satu sebagai controller dengan Ryu Controller, serta VM berikutnya untuk simulasi jaringan menggunakan Containernet, Open vSwitch, dan Docker Engine. Fokus utama adalah membangun topologi, memastikan seluruh node terhubung dalam satu cluster, serta menyediakan dashboard monitoring jaringan.

# Anggota Kelompok 
1. Anggel Agustina Gultom - 101012400169 
2. Zahra Nailah Rianto - 101012400253 
3. Rafi Ikbar Fahrezy - 103012400289
4. Jibriel Taqy Erfittov - 101032580036

# Topologi
<img width="1475" height="703" alt="Screenshot 2026-04-10 080244" src="https://github.com/user-attachments/assets/c9e61c6c-9ff1-4542-9413-0f7cce77ab16" />

 # Requirements :  
VM1 :   
○ OS : Ubuntu Server 22.04 

○ SDN Controller : Ryu Controller 
 

VM2 : 
○ OS : Ubuntu Server 22.04 

○ Containernet 

○ Open vSwitch (OVS)  

○ Docker Engine 

# Penjelasan Topologi
  Topology pada gambar ini menggambarkan arsitektur Software Defined Networking (SDN) yang menerapkan Cluster Hadoop yang berjalan di dalam container Docker. Topologi ini terdiri dari dua Virtual Machine (VM) di mana pada VM1 menjadi Management Node atau pada struktur SDN berperan sebagai Control Plane dan VM2 menjadi Infrastruktur Node atau Data Plane. Kedua VM tersebut bekerja sama untuk mengelola jaringan dan menjalankan proses data menggunakan Hadoop.
  Pada VM1 ini bersifat sebagai pusat pengendali jaringan yang didalamnya terdapat SDN Controller yang nantinya controller ini akan mengatur lalu lintas data mengalir di jaringan. Selanjutnya ada OpenFlow, di mana OpenFlow ini berfungsi untuk komunikasi antara controller dan perangkat jaringan melalui protokol OpenFlow (menentukan jalur paket data). 
  Pada VM2 itu punya komponen Jaringan Spine Leaf dengan menggunakan OVS (Open vSwitch) di mana spine ini sebagai inti jaringan yang menghubungkan leaf switch dan leaf switch itu menghubung ke container. Setiap leaf switch terhubung ke semua spine switch, menciptakan banyak jalur yang efisien. 
  Cluster Hadoop yang berjalan pada container terdiri dari : 
Hadoop Master : mengelola data dan struktur penyimpanan HDFS
Hadoop Worker 1 : menyimpan dan memproses data (DataNode)
Hadoop Worker 2 : menyimpan dan memproses data tambahan (DataNode)
