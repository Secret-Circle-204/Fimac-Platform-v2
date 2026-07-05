import Image from "next/image"
export const Logo = () => {
  return (
    <div className="w-full  mx-auto flex items-center gap-1">
      <Image
        src={"/blue-logo.svg"}
        alt="Logo"
        width={100}
        height={100}
        className="object-cover h-10 w-auto"
      />
    </div>
  )
}
