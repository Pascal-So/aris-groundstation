using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

public class csvreader : MonoBehaviour {

    public bool useBarometer = false;

    List<float> times = new List<float>();
    List<Quaternion> rots = new List<Quaternion>();
    List<Vector3> poss = new List<Vector3>();
    GameObject engine;
    GameObject flare;
    GameObject engineglow;
    public Transform point;

    private static int BinarySearch<T>(IList<T> list, T value)
    {
        if (list == null)
            throw new ArgumentNullException("list");
        var comp = Comparer<T>.Default;
        int lo = 0, hi = list.Count - 1;
        while (lo < hi)
        {
            int m = (hi + lo) / 2;  // this might overflow; be careful.
            if (comp.Compare(list[m], value) < 0) lo = m + 1;
            else hi = m - 1;
        }
        if (comp.Compare(list[lo], value) < 0) lo++;
        return Math.Min(list.Count - 1, lo);
    }

    Quaternion firstRot = Quaternion.identity;
    void Start () {
        engine = GameObject.Find("Afterburner");
        flare = GameObject.Find("Flare");
        engineglow = GameObject.Find("Glow");
        string[] lines = File.ReadAllLines("C:\\Users\\User\\Documents\\rpi\\sensors_pro.log");
        float prevtime = -10000;
        float height = 0;
        float posx, posy, posz;
        posx = posy = posz = 0;
        foreach (string line in lines)
        {
            string[] explode = line.Split(' ');
            float time;
            try
            {
                float.TryParse(explode[0], out time);
            }
            catch (Exception ex)
            {
                continue;
            }
            if (time < prevtime)
            {
                time = prevtime + 0.001f;
            }
            prevtime = time;
            if (time > 24.5) break;
            try
            {
                switch (explode[1])
                {
                    case "p":
                    case "pos":
                        posx = float.Parse(explode[2]);
                        posz = float.Parse(explode[3]);
                        posy = float.Parse(explode[useBarometer ? 4 : 5]);
                        height = posz;//Math.sqrt(posx * posx + posy * posy + posz * posz);
                        break;
                    case "r":
                    case "rot":
                        float rotx = float.Parse(explode[2]);
                        float roty = float.Parse(explode[3]);
                        float rotz = float.Parse(explode[4]);
                        float rotw = float.Parse(explode[5]);
                        times.Add(time + 3);
                        poss.Add(new Vector3(posx, posy, posz));
                        rots.Add(new Quaternion(rotx, rotz, roty, rotw));
                        break;
                }
            }
            catch (Exception ex)
            {
            }
        }
        Debug.Log(times.Count + " = " + poss.Count);
    }

    float time = 0;

    float lastinst = 0;

    // Update is called once per frame
    float maxAngle = 0;
    void Update () {
        if (Time.time - lastinst > 0.1 && Time.time > 3)
        {
            lastinst = Time.time;
            GameObject.Instantiate(point, transform.position + UnityEngine.Random.onUnitSphere * 3, Quaternion.identity);
        }
        engine.GetComponent<ParticleSystem>().enableEmission = (time > 3) && time < 4.3;
        engineglow.GetComponent<ParticleSystem>().enableEmission = (time > 3) && time < 4.3;
        flare.GetComponent<LensFlare>().enabled = (time > 3) && time < 4.3;
        time += Time.deltaTime;
        int i = BinarySearch(times, time);
        if (i == times.Count - 1) time = 0;
        transform.position = poss[i];
        transform.rotation = rots[i];
        if (firstRot == Quaternion.identity) firstRot = Quaternion.Inverse(transform.rotation);
        transform.rotation = firstRot * transform.rotation;
        maxAngle = Mathf.Max(maxAngle, Vector3.Angle(transform.up, Vector3.up));
        Debug.Log(maxAngle);
    }
}
