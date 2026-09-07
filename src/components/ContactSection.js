export class ContactSection {
  constructor(soundManager) {
    this.soundManager = soundManager;
    this.form = document.getElementById('transponder-form');
    this.feedback = document.getElementById('form-feedback');
    this.submitBtn = document.getElementById('submit-btn');

    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const nameInput = document.getElementById('applicant-name');
    const roleInput = document.getElementById('applicant-role');
    const msgInput = document.getElementById('applicant-message');

    const name = nameInput?.value.trim() || 'Brave Adventurer';
    const role = roleInput?.value || 'Nakama';

    // Play transmission chime
    if (this.soundManager) {
      this.soundManager.playTransmissionSound();
    }

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = 'TRANSMITTING VIA DEN DEN MUSHI...';
    }

    setTimeout(() => {
      if (this.feedback) {
        this.feedback.className = 'form-feedback-message success';
        this.feedback.innerHTML = `
          <div style="font-size: 1.1rem; font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">
            ✦ DEN DEN MUSHI TRANSMISSION CONFIRMED! ✦
          </div>
          <p style="color: var(--text-primary); margin-bottom: 0.5rem;">
            Log Pose Frequency synchronized, <strong>${name}</strong>.
          </p>
          <p style="color: var(--text-secondary); font-size: 0.8rem;">
            Luffy and the crew have received your transmission for the role of <strong>${role}</strong>. Prepare your ship — our flagship sets sail at dawn!
          </p>
        `;
      }

      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = 'TRANSMISSION DELIVERED ✦';
      }

      this.form.reset();
    }, 1200);
  }
}
