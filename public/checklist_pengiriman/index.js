const nama_pelanggan = document.querySelector("#nama_pelanggan");

const eleSj = document.querySelector('tbody tr:nth-child(1) td:nth-child(3)')
const eleCheMrk = document.querySelector('tbody tr:nth-child(2) td:nth-child(3)')
const eleBarang = document.querySelector('tbody tr:nth-child(3) td:nth-child(3)')
const elePalet = document.querySelector('tbody tr:nth-child(4) td:nth-child(3)')
const eleCOA = document.querySelector('tbody tr:nth-child(5) td:nth-child(3)')
const eleDelCard = document.querySelector('tbody tr:nth-child(6) td:nth-child(3)')
const eleQty = document.querySelector('tbody tr:nth-child(7) td:nth-child(3)')

if(nama_pelanggan.textContent=="ASIAN ISUZU CASTING CENTER PT."){
    eleCheMrk.innerHTML = '<i class="bi bi-check"></i>'
} else if(nama_pelanggan.textContent=="YAMAHA MOTOR PARTS MANUFACTURING INDONESIA PT."){
    console.log(eleDelCard.innerHTML)
    eleDelCard.innerHTML = '<i class="bi bi-check"></i>'
}