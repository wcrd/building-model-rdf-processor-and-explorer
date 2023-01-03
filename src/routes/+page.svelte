<h1>TTL Model Enhancer</h1>
<div>
    <h2>Upload TTL Model</h2>
    
    <label for="ttl-upload">Upload file:</label>
    <input 
        type="file"
        id="ttl-upload"
        name="ttl-upload"
        accept=".ttl"
        bind:files
    >
    <p>{files}</p>
</div>

<script>
    import N3 from 'n3'
    // import wasmtree from '@bruju/wasm-tree';

    let files;
    // let store = new wasmtree.Store();
    let store = new N3.Store()

    $: if (files) {
		  // Note that `files` is of type `FileList`, not an Array:
		  // https://developer.mozilla.org/en-US/docs/Web/API/FileList
		  const file = files[0]

      // I can't figure out streams, just going to load le data.
      // Use N3
      fileHandler(file).then(rdf_text => {
          const parser = new N3.Parser()
          parser.parse(rdf_text, (error, quad, prefixes) => {
                  if (quad) {
                      // console.log(quad);
                      store.addQuad(quad)
                  } else {
                      console.log("Prefixes: ", prefixes);
                      console.log("# That's all, folks!");
                      console.log(store)
                  }
              });
        })
    }

    // // //
    // File Reading Functions
    // // //
    async function fileHandler(file){
        const reader = new FileReader()
        const fileBlob = await file.stream()
        const streamHandle = await streamToText(fileBlob)
        return streamHandle
    };

    const streamToText = async (blob) => {
      const readableStream = await blob.getReader();
      const chunk = await readableStream.read();

      return new TextDecoder('utf-8').decode(chunk.value);
    };

</script>