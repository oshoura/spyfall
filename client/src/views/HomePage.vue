<template>
  <div class="home-page">
    <header class="hero">
      <div class="hero-content">
        <h1 class="title">Spyfall</h1>
        <p class="tagline">The ultimate party game of deception and deduction</p>
        <div class="cta-buttons">
          <router-link to="/play" class="cta-button primary">Play Now</router-link>
          <a href="#how-to-play" class="cta-button secondary">How to Play</a>
        </div>
      </div>
    </header>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🎮</div>
        <h3>Easy to Learn</h3>
        <p>Simple rules that anyone can pick up in minutes</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👥</div>
        <h3>Multiplayer</h3>
        <p>Play with 3-8 friends online from anywhere</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🌍</div>
        <h3>Diverse Locations</h3>
        <p>Over 30 unique locations across different packs</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🕵️</div>
        <h3>Be the Spy</h3>
        <p>Blend in or catch the impostor among you</p>
      </div>
    </section>

    <section id="how-to-play" class="how-to-play">
      <h2>How to Play</h2>
      
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Create or Join a Party</h3>
          <p>One player creates a party and shares the unique code with friends. Others use this code to join the same game room.</p>
          <TutorialImages type="create-party" />
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Select Location Packs</h3>
          <p>The host can choose which location packs to include in the game: Basic, Advanced, or Tourist Attractions.</p>
          <TutorialImages type="location-packs" />
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Start the Game</h3>
          <p>Once everyone is ready, the host starts the game. Each player is assigned a role - one player becomes the spy, while others learn the location.</p>
          <TutorialImages type="start-game" />
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h3>Ask Questions</h3>
          <p>Players take turns asking each other questions about the location. The spy must pretend to know where they are, while others try to identify the spy without revealing too much.</p>
          <TutorialImages type="asking-questions" />
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">5</div>
        <div class="step-content">
          <h3>Vote for the Spy</h3>
          <p>When the timer ends, everyone votes on who they think is the spy. If the spy is caught, the other players win. If not, the spy wins!</p>
          <TutorialImages type="voting" />
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">6</div>
        <div class="step-content">
          <h3>Play Multiple Rounds</h3>
          <p>Play several rounds with different locations and a new spy each time. The player with the most points at the end wins!</p>
          <TutorialImages type="multiple-rounds" />
        </div>
      </div>
    </section>

    <section class="tips">
      <h2>Pro Tips</h2>
      <div class="tips-container">
        <div class="tip">
          <h3>For the Spy</h3>
          <ul>
            <li>Listen carefully to other players' questions and answers</li>
            <li>Ask vague questions that could apply to many locations</li>
            <li>If you figure out the location, start asking more specific questions</li>
            <li>Don't be afraid to guess the location if you're about to be caught</li>
          </ul>
        </div>
        <div class="tip">
          <h3>For Other Players</h3>
          <ul>
            <li>Ask questions that only someone at the location would know</li>
            <li>Be careful not to give away too much information</li>
            <li>Pay attention to suspicious answers or questions</li>
            <li>Coordinate with other players to trap the spy</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to Play?</h2>
      <p>Gather your friends and start a game now!</p>
      <router-link to="/play" class="cta-button primary large">Play Spyfall</router-link>
    </section>

    <footer class="footer">
      <p>&copy; 2023 Spyfall Game. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import TutorialImages from '../components/TutorialImages.vue';
</script>

<style scoped>
.home-page {
  max-width: 100%;
  overflow-x: hidden;
}

.hero {
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 4rem;
  margin-bottom: 1rem;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.tagline {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s;
}

.cta-button.primary {
  background-color: #ff5722;
  color: white;
}

.cta-button.secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.large {
  padding: 1rem 2rem;
  font-size: 1.2rem;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.cta-button.primary:hover {
  background-color: #ff7043;
}

.cta-button.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  background-color: #f8f9fa;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.feature-card p {
  color: #6c757d;
}

.how-to-play {
  padding: 4rem 2rem;
  background-color: white;
}

.how-to-play h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
  font-size: 2.5rem;
}

.step {
  display: flex;
  margin-bottom: 4rem;
  align-items: flex-start;
}

.step-number {
  background-color: #ff5722;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.step-content p {
  margin-bottom: 1rem;
  color: #6c757d;
}

.step-image {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tips {
  padding: 4rem 2rem;
  background-color: #f8f9fa;
}

.tips h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
  font-size: 2.5rem;
}

.tips-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tip {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.tip h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  text-align: center;
}

.tip ul {
  padding-left: 1.5rem;
}

.tip li {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.cta-section {
  padding: 6rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: white;
}

.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-section p {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  opacity: 0.9;
}

.footer {
  padding: 2rem;
  text-align: center;
  background-color: #2c3e50;
  color: white;
}

@media (max-width: 768px) {
  .title {
    font-size: 3rem;
  }
  
  .step {
    flex-direction: column;
  }
  
  .step-number {
    margin-bottom: 1rem;
  }
}
</style> 