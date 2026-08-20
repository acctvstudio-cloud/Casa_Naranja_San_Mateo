document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const addPlayerBtn = document.getElementById('addPlayerBtn');
  const playersList = document.getElementById('playersList');
  const teamForm = document.getElementById('teamForm');
  const hiddenPlayersInput = document.getElementById('hiddenPlayersInput');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  let playerCount = 0;

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  function addPlayerRow() {
    playerCount++;
    const row = document.createElement('div');
    row.className = 'player-row';
    row.dataset.id = playerCount;

    row.innerHTML = `
      <div class="form-group" style="margin-bottom:0;">
        <input type="text" class="player-name" placeholder="Nombre Completo del Jugador" required>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <input type="number" class="player-age" placeholder="Edad" min="25" max="35" required>
      </div>
      <button type="button" class="btn-remove" title="Eliminar Jugador">&times;</button>
    `;

    playersList.appendChild(row);

    row.querySelector('.btn-remove').addEventListener('click', () => {
      row.remove();
    });
  }

  addPlayerRow();

  if (addPlayerBtn) {
    addPlayerBtn.addEventListener('click', addPlayerRow);
  }

  if (teamForm) {
    teamForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const playerRows = document.querySelectorAll('.player-row');
      let playersData = [];
      let ageValid = true;

      playerRows.forEach((row, index) => {
        const name = row.querySelector('.player-name').value.trim();
        const age = parseInt(row.querySelector('.player-age').value.trim(), 10);

        if (age < 25 || age > 35) {
          ageValid = false;
        }

        if (name && age) {
          playersData.push(`${index + 1}. ${name} (${age} años)`);
        }
      });

      if (!ageValid) {
        showStatus('Todos los jugadores deben tener entre 25 y 35 años de edad.', 'error');
        return;
      }

      if (playersData.length === 0) {
        showStatus('Debes agregar al menos un integrante al equipo.', 'error');
        return;
      }

      hiddenPlayersInput.value = playersData.join(' | ');

      submitBtn.disabled = true;
      submitBtn.textContent = 'ENVIANDO REGISTRO...';

      try {
        const formData = new FormData(teamForm);
        const response = await fetch(teamForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          showStatus('¡Registro enviado con éxito! Nos pondremos en contacto contigo.', 'success');
          teamForm.reset();
          playersList.innerHTML = '';
          addPlayerRow();
        } else {
          const data = await response.json();
          if (Object.hasOwn(data, 'errors')) {
            showStatus(data.errors.map(error => error.message).join(', '), 'error');
          } else {
            showStatus('Ocurrió un inconveniente al enviar. Inténtalo de nuevo.', 'error');
          }
        }
      } catch (error) {
        showStatus('Error de conexión. Revisa tu red e inténtalo nuevamente.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ENVIAR REGISTRO';
      }
    });
  }

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
  }
});