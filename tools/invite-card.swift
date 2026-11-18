// Draws the link preview cards (Open Graph images, 1200 × 630) with the app's own fonts and colours.
// swiftc -O -o /tmp/invite-card tools/invite-card.swift && /tmp/invite-card assets/icon-512.png assets
import SwiftUI
import AppKit

extension Color {
    init(hex: UInt32) {
        self.init(red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255)
    }
}
let night = Color(hex: 0x0F1020), surface = Color(hex: 0x1B1D33), text = Color(hex: 0xF6F4EE)
let muted = Color(hex: 0x9EA0BC), ink = Color(hex: 0x121326), lime = Color(hex: 0xC8F031)
let sun = Color(hex: 0xFFC93C), sky = Color(hex: 0x4CC9F0)

struct Card: View {
    let lines: [String]
    let sub: String
    let icon: NSImage
    var body: some View {
        ZStack {
            night
            // Two large soft shapes of the app's colours, far in the corners.
            Circle().fill(Color(hex: 0x5B7CFF).opacity(0.16)).frame(width: 520, height: 520).offset(x: 520, y: -300)
            Circle().fill(lime.opacity(0.10)).frame(width: 420, height: 420).offset(x: -560, y: 300)
            HStack(spacing: 60) {
                Image(nsImage: icon).resizable().interpolation(.high).frame(width: 290, height: 290)
                    .clipShape(RoundedRectangle(cornerRadius: 66, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 66, style: .continuous).stroke(text.opacity(0.10), lineWidth: 3))
                    .rotationEffect(.degrees(-4))
                VStack(alignment: .leading, spacing: 30) {
                    VStack(alignment: .leading, spacing: -6) {
                        ForEach(lines, id: \.self) { Text($0) }
                    }
                    .font(.system(size: 78, weight: .black).width(.expanded)).foregroundStyle(text)
                    HStack(spacing: 9) {
                        ForEach(Array("RARQIO".enumerated()), id: \.offset) { index, letter in
                            Text(String(letter)).font(.system(size: 40, weight: .black).width(.expanded)).foregroundStyle(ink)
                                .frame(width: 70, height: 84)
                                .background(index < 3 ? sun : sky, in: RoundedRectangle(cornerRadius: 19, style: .continuous))
                                .rotationEffect(.degrees(index.isMultiple(of: 2) ? -2 : 2))
                            if index == 2 { Spacer().frame(width: 8) }
                        }
                    }
                    Text(sub).font(.system(size: 31, weight: .semibold)).foregroundStyle(muted)
                }
            }
            .padding(.horizontal, 70)
        }
        .frame(width: 1200, height: 630)
    }
}

@MainActor func render(_ lines: [String], _ sub: String, icon: NSImage, to path: String) {
    let renderer = ImageRenderer(content: Card(lines: lines, sub: sub, icon: icon))
    renderer.scale = 1
    guard let image = renderer.cgImage else { fatalError("no image") }
    let rep = NSBitmapImageRep(cgImage: image)
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
    print(path, image.width, image.height)
}

let arguments = CommandLine.arguments
guard let icon = NSImage(contentsOfFile: arguments[1]) else { fatalError("icon") }
MainActor.assumeIsolated {
    render(["REJOINS", "MON SALON"], "Touche le lien et joue avec moi", icon: icon, to: arguments[2] + "/invite-fr.png")
    render(["JOIN", "MY ROOM"], "Tap the link and play with me", icon: icon, to: arguments[2] + "/invite-en.png")
    render(["DÉFI", "DU JOUR"], "5 questions, les mêmes pour tous", icon: icon, to: arguments[2] + "/daily-fr.png")
    render(["DAILY", "CHALLENGE"], "5 questions, the same for everyone", icon: icon, to: arguments[2] + "/daily-en.png")
}
