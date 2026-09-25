const fs = require('fs');
let js = fs.readFileSync('admin.js', 'utf8');

js = js.replace(/card\.innerHTML = \`[\s\S]*?<\/strong>[\s\S]*?<\/div>[\s\S]*?<\/div>\`;/g, 
`card.innerHTML = \`
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
                    <div>
                        <strong style="color:var(--text-primary)">\${r.userName || 'Anónimo'}</strong>
                        <span style="color:var(--text-secondary);margin-left:.4rem">\${dateStr}</span>
                    </div>
                    <button class="del-review-btn" data-id="\${doc.id}" style="background:none;border:none;color:#ff4757;cursor:pointer;font-size:1.1rem" title="Eliminar reseña">???</button>
                </div>
                <div style="color:#ffd700;margin-bottom:.3rem">
                    \${'?'.repeat(Math.round(r.score || 5))}\${'?'.repeat(5 - Math.round(r.score || 5))}
                </div>
                <div style="color:var(--text-secondary);line-height:1.4">
                    \${r.comment || ''}
                </div>
            \`;`);

const deleteLogic = `
    setTimeout(() => {
        list.querySelectorAll('.del-review-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(!confirm('¿Seguro que deseas eliminar esta reseña?')) return;
                const revId = e.currentTarget.getAttribute('data-id');
                try {
                    await db.collection('products').doc(prodId).collection('reviews').doc(revId).delete();
                    alert('Reseña eliminada.');
                    loadAdminReviews(prodId);
                } catch(err) {
                    console.error('Error eliminando reseña:', err);
                    alert('Error eliminando reseña');
                }
            });
        });
    }, 100);
`;

if(!js.includes('.del-review-btn')) {
    js = js.replace(/list\.appendChild\(card\);\n\s*\}\);\n\s*\} catch/, "list.appendChild(card);\n        });\n" + deleteLogic + "\n    } catch");
}

const modalLogic = `
const addReviewModal = document.getElementById('addReviewModal');
const adminAddReviewBtn = document.getElementById('adminAddReviewBtn');
if(adminAddReviewBtn) {
    adminAddReviewBtn.addEventListener('click', () => {
        const prodId = document.getElementById('adminReviewsProductSelect').value;
        if(!prodId) return alert('Por favor selecciona un producto primero de la lista desplegable.');
        addReviewModal.classList.remove('hidden');
    });
}
const closeAddReviewBtn = document.getElementById('closeAddReviewBtn');
if(closeAddReviewBtn) {
    closeAddReviewBtn.addEventListener('click', () => addReviewModal.classList.add('hidden'));
}
const saveManRevBtn = document.getElementById('saveManRevBtn');
if(saveManRevBtn) {
    saveManRevBtn.addEventListener('click', async () => {
        const prodId = document.getElementById('adminReviewsProductSelect').value;
        const name = document.getElementById('manRevName').value.trim() || 'Anónimo';
        const score = parseInt(document.getElementById('manRevScore').value) || 5;
        const comment = document.getElementById('manRevComment').value.trim();
        const dateStr = document.getElementById('manRevDate').value;
        
        if(!prodId) return alert('Selecciona un producto');
        if(!comment) return alert('Debes escribir un comentario');
        
        saveManRevBtn.disabled = true;
        saveManRevBtn.textContent = 'Guardando...';
        try {
            const date = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
            await db.collection('products').doc(prodId).collection('reviews').add({
                userName: name,
                score: score,
                comment: comment,
                date: firebase.firestore.Timestamp.fromDate(date)
            });
            alert('Reseña añadida correctamente.');
            addReviewModal.classList.add('hidden');
            document.getElementById('manRevComment').value = '';
            loadAdminReviews(prodId);
        } catch(err) {
            console.error('Error guardando reseña:', err);
            alert('Error guardando reseña');
        }
        saveManRevBtn.disabled = false;
        saveManRevBtn.textContent = 'Guardar Reseña';
    });
}
`;

if(!js.includes('addReviewModal')) {
    js += modalLogic;
}

fs.writeFileSync('admin.js', js);
console.log('Admin JS reviews features added');
