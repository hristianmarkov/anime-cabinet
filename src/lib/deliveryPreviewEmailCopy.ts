export function deliveryPreviewEmailCopy(styleName: string, versionNumber: number) {
  if (versionNumber > 1) {
    return {
      subject: `A new version of your ${styleName} artwork is ready`,
      heading: "A new artwork version is ready",
      introduction: `We\'ve uploaded version ${versionNumber} of your ${styleName} artwork with the latest changes. View it securely on your order page, where you can compare it with earlier versions and leave any further revision comments.`,
    };
  }

  return {
    subject: `Your ${styleName} artwork is ready to review`,
    heading: "Your artwork preview is ready",
    introduction: `We\'ve prepared a preliminary version of your ${styleName}. View it securely on your order page, where you can compare versions and leave revision comments.`,
  };
}
