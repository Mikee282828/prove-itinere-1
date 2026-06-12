export default function SezioneOrari({ active }: { active: boolean }) {
  if (active) {
    return <div className="p-8">Orari</div>;
  }
}
