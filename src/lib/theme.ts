// Bhavin Garara Theme Configuration
export const theme = {
  colors: {
    primary: '#27A48C',
    primaryDark: '#0F3E35',
    gradient: {
      from: '#27A48C',
      to: '#0F3E35'
    }
  },
  gradients: {
    radial: 'radial-gradient(circle at 30% 50%, #27A48C 0%, #0F3E35 70%)',
    linear: 'linear-gradient(135deg, #27A48C 0%, #0F3E35 100%)',
    button: 'linear-gradient(135deg, #27A48C 0%, #0F3E35 100%)',
    card: 'linear-gradient(135deg, #27A48C 0%, #0F3E35 100%)'
  }
};

export const getGradient = (
  type: 'radial' | 'linear' | 'button' | 'card' = 'linear'
) => {
  return theme.gradients[type];
};
