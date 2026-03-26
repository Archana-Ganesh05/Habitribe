fetch('http://localhost:5000/api/factions')
  .then(res => res.json())
  .then(factions => {
    const csFactions = factions.filter(f => f.niche === 'cs');
    console.log(JSON.stringify(csFactions, null, 2));
  })
  .catch(console.error);
